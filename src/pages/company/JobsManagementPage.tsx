import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JobPosting, EmploymentType } from '../../types';
import { collection, query, where, getDocs, setDoc, updateDoc, doc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../../firebase/config';
import {
  Briefcase,
  Plus,
  Edit3,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  Clock,
  Layers,
  ShieldAlert,
  Users
} from 'lucide-react';

export const JobsManagementPage: React.FC = () => {
  const { currentUser, companyProfile } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for creating or editing job
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full-time');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [salaryRange, setSalaryRange] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isVerified = companyProfile?.verificationStatus === 'verified';

  const fetchCompanyJobs = async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, 'jobs'),
        where('companyId', '==', currentUser.uid)
      );
      const snap = await getDocs(q);
      const list: JobPosting[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as any) });
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setJobs(list);
    } catch (err) {
      console.warn('Jobs fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyJobs();
  }, [currentUser]);

  const handleOpenCreateModal = () => {
    setEditingJobId(null);
    setTitle('');
    setDescription('');
    setRequiredSkills('React, TypeScript, REST APIs');
    setEligibility("Bachelor's or Master's degree in Engineering, CS, or IT graduating in 2025/2026.");
    setLocation(companyProfile?.location || 'San Francisco, CA / Remote');
    setEmploymentType('full-time');
    setDeadline('2026-12-31');
    setSalaryRange('$20,000 - $35,000 / yr');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job: JobPosting) => {
    setEditingJobId(job.id);
    setTitle(job.title);
    setDescription(job.description);
    setRequiredSkills(job.requiredSkills.join(', '));
    setEligibility(job.eligibility);
    setLocation(job.location);
    setEmploymentType(job.employmentType);
    setDeadline(job.deadline);
    setSalaryRange(job.salaryRange || '');
    setIsModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!title.trim() || !description.trim()) {
      setFeedbackMsg({ text: 'Please fill in the job title and description.', type: 'error' });
      return;
    }

    const skillsArray = requiredSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      if (editingJobId) {
        // Update existing job
        const jobRef = doc(db, 'jobs', editingJobId);
        const updates = {
          title: title.trim(),
          description: description.trim(),
          requiredSkills: skillsArray,
          eligibility: eligibility.trim(),
          location: location.trim(),
          employmentType,
          deadline,
          salaryRange: salaryRange.trim(),
          updatedAt: new Date().toISOString()
        };
        await updateDoc(jobRef, updates);
        setJobs(jobs.map((j) => (j.id === editingJobId ? { ...j, ...updates } : j)));
        setFeedbackMsg({ text: 'Job listing updated successfully.', type: 'success' });
      } else {
        // Create new job
        const newId = `job-${currentUser.uid}-${Date.now()}`;
        const newJob: JobPosting = {
          id: newId,
          companyId: currentUser.uid,
          companyName: companyProfile?.companyName || 'MNC Partner',
          title: title.trim(),
          description: description.trim(),
          requiredSkills: skillsArray,
          eligibility: eligibility.trim(),
          location: location.trim(),
          employmentType,
          deadline,
          salaryRange: salaryRange.trim(),
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'jobs', newId), newJob);
        setJobs([newJob, ...jobs]);
        setFeedbackMsg({ text: 'New job opportunity published.', type: 'success' });
      }
      setIsModalOpen(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({ text: 'Error saving job: ' + err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: 'active' | 'closed') => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setJobs(jobs.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
      setFeedbackMsg({
        text: `Job listing status updated to ${newStatus}.`,
        type: 'success'
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({ text: 'Failed to update job status: ' + err.message, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-2">
              <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Job &amp; Internship Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Manage Company Openings
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Create, update, and manage job listings for {companyProfile?.companyName}.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Listing</span>
          </button>
        </div>

        {/* Verification Warning notice if unverified */}
        {!isVerified && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Pending Employer Verification:</span> Listings created during the pending phase can be configured, previewed, and reviewed by your team. They will be distributed to candidate search upon completion of work email domain verification.
            </div>
          </div>
        )}

        {/* Feedback alert */}
        {feedbackMsg && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Jobs List Table / Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Your Company Job Postings ({jobs.length})
            </h3>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 italic p-6">Loading posted listings...</p>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-500 text-xs space-y-3">
              <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700 text-sm">No job openings created yet</p>
              <p>Click "Post New Listing" to publish an opportunity for student talent.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">{job.title}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          job.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {job.status}
                      </span>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {job.employmentType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Deadline: {job.deadline}
                      </span>
                      {job.salaryRange && <span>Comp: {job.salaryRange}</span>}
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {job.requiredSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(job)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleToggleJobStatus(job.id, job.status)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        job.status === 'active'
                          ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {job.status === 'active' ? 'Close Listing' : 'Reactivate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Create / Edit Job */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                {editingJobId ? 'Edit Job Posting' : 'Create New Opportunity'}
              </h3>

              <form onSubmit={handleSaveJob} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job / Internship Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Associate Full-Stack Engineer"
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Employment Type
                    </label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                      className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="full-time">Full-Time</option>
                      <option value="internship">Internship</option>
                      <option value="part-time">Part-Time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Location / Mode
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco / Remote"
                      className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Description &amp; Responsibilities
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detail the daily responsibilities, stack, team culture, and growth pathways..."
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Required Competencies / Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={requiredSkills}
                    onChange={(e) => setRequiredSkills(e.target.value)}
                    placeholder="e.g. React, TypeScript, Docker, SQL"
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Eligibility &amp; Education Criteria
                  </label>
                  <input
                    type="text"
                    value={eligibility}
                    onChange={(e) => setEligibility(e.target.value)}
                    placeholder="e.g. Graduating students in CS/IT with strong fundamentals"
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Salary / Compensation Range
                    </label>
                    <input
                      type="text"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                      placeholder="e.g. $25,000 - $35,000 / yr"
                      className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingJobId ? 'Save Edits' : 'Publish Opening'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
