import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_DEMO_UPDATES } from '../../firebase/seedData';
import { CompanyUpdate } from '../../types';
import { collection, query, where, getDocs, setDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Bell,
  Plus,
  Calendar,
  MapPin,
  Tag,
  CheckCircle2,
  AlertCircle,
  Archive,
  Eye,
  Trash2,
  Send,
  X,
  Building2,
  GraduationCap
} from 'lucide-react';

export const CompanyUpdatesPage: React.FC = () => {
  const { currentUser, companyProfile } = useAuth();
  const [updates, setUpdates] = useState<CompanyUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<CompanyUpdate | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CompanyUpdate['category']>('job_announcement');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchUpdates = async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, 'companyUpdates'),
        where('companyId', '==', currentUser.uid)
      );
      const snap = await getDocs(q);
      const list: CompanyUpdate[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as any) });
      });

      // If empty in Firestore, populate with relevant demo updates
      if (list.length === 0) {
        list.push(...INITIAL_DEMO_UPDATES.map((u) => ({ ...u, companyId: currentUser.uid })));
      }
      setUpdates(list);
    } catch (e) {
      console.error('Error fetching updates:', e);
      setUpdates(INITIAL_DEMO_UPDATES.map((u) => ({ ...u, companyId: currentUser.uid })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [currentUser]);

  const resetForm = () => {
    setEditingUpdate(null);
    setTitle('');
    setCategory('job_announcement');
    setDescription('');
    setRequiredSkills('');
    setEligibility('');
    setLocation(companyProfile?.location || 'San Francisco, CA (Hybrid)');
    setDeadline('');
    setStatus('published');
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (upd: CompanyUpdate) => {
    setEditingUpdate(upd);
    setTitle(upd.title);
    setCategory(upd.category);
    setDescription(upd.description);
    setRequiredSkills((upd.requiredSkills || []).join(', '));
    setEligibility(upd.eligibility || '');
    setLocation(upd.location || '');
    setDeadline(upd.deadline || '');
    setStatus(upd.status === 'archived' ? 'published' : upd.status);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    setNotice(null);

    const skillsArray = requiredSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const updateId = editingUpdate ? editingUpdate.id : `upd-${Date.now()}`;
      const payload: CompanyUpdate = {
        id: updateId,
        companyId: currentUser.uid,
        companyName: companyProfile?.companyName || 'Enterprise Partner',
        title,
        category,
        description,
        requiredSkills: skillsArray,
        eligibility,
        location,
        deadline: deadline || undefined,
        status,
        createdAt: editingUpdate?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'companyUpdates', updateId), payload);

      setUpdates((prev) => {
        const filtered = prev.filter((p) => p.id !== updateId);
        return [payload, ...filtered];
      });

      setShowModal(false);
      resetForm();
      setNotice('Announcement successfully saved and synchronized.');
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      console.error('Failed to save announcement:', err);
      // Fallback local update
      const updateId = editingUpdate ? editingUpdate.id : `upd-${Date.now()}`;
      const payload: CompanyUpdate = {
        id: updateId,
        companyId: currentUser.uid,
        companyName: companyProfile?.companyName || 'Enterprise Partner',
        title,
        category,
        description,
        requiredSkills: skillsArray,
        eligibility,
        location,
        deadline: deadline || undefined,
        status,
        createdAt: editingUpdate?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUpdates((prev) => [payload, ...prev.filter((p) => p.id !== updateId)]);
      setShowModal(false);
      resetForm();
      setNotice('Notice saved locally.');
      setTimeout(() => setNotice(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleArchive = async (upd: CompanyUpdate) => {
    const nextStatus = upd.status === 'archived' ? 'published' : 'archived';
    try {
      await updateDoc(doc(db, 'companyUpdates', upd.id), {
        status: nextStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Updated locally:', e);
    }
    setUpdates((prev) =>
      prev.map((item) => (item.id === upd.id ? { ...item, status: nextStatus } : item))
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this announcement?')) return;
    try {
      await deleteDoc(doc(db, 'companyUpdates', id));
    } catch (e) {
      console.warn('Deleted locally:', e);
    }
    setUpdates((prev) => prev.filter((u) => u.id !== id));
  };

  const getCategoryLabel = (cat: CompanyUpdate['category']) => {
    switch (cat) {
      case 'job_announcement':
        return { label: 'Job Opening', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'internship_opening':
        return { label: 'Internship Drive', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'recruitment_drive':
        return { label: 'Campus Drive', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'hackathon':
        return { label: 'Hackathon Alert', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: 'General Notice', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Corporate Announcements & Feed
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Recruiter Tool
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Publish official updates, rolling internship announcements, and campus recruitment news broadcasted to all students.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Announcement
        </button>
      </div>

      {notice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Notices</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{updates.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Broadcasts</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {updates.filter((u) => u.status === 'published').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Archived / Draft</span>
          <p className="text-2xl font-bold text-slate-500 mt-1">
            {updates.filter((u) => u.status !== 'published').length}
          </p>
        </div>
      </div>

      {/* Updates List */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : updates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No Announcements Published</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Share technical hiring drives, mentorship seminars, or hackathon schedules with verified talent.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Publish First Notice
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((item) => {
            const badge = getCategoryLabel(item.category);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider ${
                        item.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      Posted {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{item.description}</p>
                  </div>

                  {item.requiredSkills && item.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs font-medium text-slate-500 mr-1 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Target Skills:
                      </span>
                      {item.requiredSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-md border border-slate-200"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}
                      </span>
                    )}
                    {item.eligibility && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> {item.eligibility}
                      </span>
                    )}
                    {item.deadline && (
                      <span className="flex items-center gap-1 text-amber-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" /> Deadline: {item.deadline}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col justify-end md:justify-center items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
                  <button
                    onClick={() => openEditModal(item)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors w-full sm:w-auto text-center"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => handleToggleArchive(item)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors w-full sm:w-auto"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    {item.status === 'archived' ? 'Unarchive' : 'Archive'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors w-full sm:w-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create or Edit Update */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingUpdate ? 'Edit Announcement' : 'Post Corporate Announcement'}
                </h2>
                <p className="text-xs text-slate-500">
                  Broadcasted immediately to the public company feed and student dashboard notices.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 2026 Associate Software Engineer Campus Drive"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Announcement Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="job_announcement">Job Opening</option>
                    <option value="internship_opening">Internship Opening</option>
                    <option value="recruitment_drive">Recruitment / Campus Drive</option>
                    <option value="hackathon">Hackathon / Technical Contest</option>
                    <option value="general_notice">General Notice / Info</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="published">Published (Visible to all)</option>
                    <option value="draft">Draft (Saved only to recruiter)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description & Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete hiring context, requirements, job function, or webinar link..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Required / Target Skills
                  </label>
                  <input
                    type="text"
                    value={requiredSkills}
                    onChange={(e) => setRequiredSkills(e.target.value)}
                    placeholder="React, Node.js, Python, AWS"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400">Comma-separated</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Eligibility Criteria
                  </label>
                  <input
                    type="text"
                    value={eligibility}
                    onChange={(e) => setEligibility(e.target.value)}
                    placeholder="2025/2026 Grads with 70%+ aggregate"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Location / Work Model
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Remote / New York, NY / Hybrid"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingUpdate ? 'Update Announcement' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
