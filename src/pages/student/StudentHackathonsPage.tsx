import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_DEMO_HACKATHONS } from '../../firebase/seedData';
import { Hackathon, HackathonSubmission } from '../../types';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Code2,
  Send,
  Github,
  Globe,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  ChevronRight,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentHackathonsPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [submissions, setSubmissions] = useState<HackathonSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit modal
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [solutionTitle, setSolutionTitle] = useState('');
  const [solutionDesc, setSolutionDesc] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, 'hackathonSubmissions'),
        where('candidateUid', '==', currentUser.uid)
      );
      const snap = await getDocs(q);
      const list: HackathonSubmission[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as any) });
      });
      setSubmissions(list);
    } catch (e) {
      console.warn('Submissions fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [currentUser]);

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedHackathon) return;

    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const subId = `sub-${currentUser.uid}-${selectedHackathon.id}`;
      const newSub: HackathonSubmission = {
        id: subId,
        hackathonId: selectedHackathon.id,
        hackathonTitle: selectedHackathon.title,
        companyId: selectedHackathon.companyId,
        candidateUid: currentUser.uid,
        candidateName: userProfile?.displayName || 'Student',
        candidateEmail: currentUser.email || '',
        solutionTitle: solutionTitle.trim(),
        solutionDescription: solutionDesc.trim(),
        githubRepoUrl: githubUrl.trim() || undefined,
        liveDemoUrl: liveDemoUrl.trim() || undefined,
        status: 'submitted',
        submittedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'hackathonSubmissions', subId), newSub);
      setSubmissions([newSub, ...submissions.filter((s) => s.id !== subId)]);
      setFeedbackMsg(`Solution "${solutionTitle}" submitted successfully for ${selectedHackathon.title}!`);
      setTimeout(() => {
        setSelectedHackathon(null);
        setFeedbackMsg(null);
      }, 2000);
    } catch (err: any) {
      setFeedbackMsg('Submission error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200">
              <Code2 className="w-3.5 h-3.5" />
              <span>Technical Competition Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hackathon Submissions &amp; Evaluations
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Submit your engineering solutions for enterprise problem statements and track rubric scores released by corporate reviewers.
            </p>
          </div>

          <Link
            to="/hackathons"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            Browse All Problem Statements
          </Link>
        </div>

        {/* Active Challenges to Submit */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Open Challenges Available for Submission
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_DEMO_HACKATHONS.map((hack) => {
              const existingSub = submissions.find((s) => s.hackathonId === hack.id);
              return (
                <div
                  key={hack.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                      {hack.companyName}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{hack.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {hack.problemStatement}
                    </p>
                    <p className="text-[11px] text-slate-500">Deadline: {hack.deadline}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    {existingSub ? (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Solution Submitted
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedHackathon(hack)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors"
                      >
                        Submit Solution
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Submissions Track */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              My Registered Submissions ({submissions.length})
            </h3>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 italic p-6">Loading submissions...</p>
          ) : submissions.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-500 text-xs space-y-2">
              <Code2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700 text-sm">No submissions recorded yet</p>
              <p>Choose an open problem statement above to submit your project solution.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{sub.solutionTitle}</h4>
                      <p className="text-xs text-slate-500">For {sub.hackathonTitle}</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
                      {sub.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {sub.solutionDescription}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                    {sub.githubRepoUrl && (
                      <a
                        href={sub.githubRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Github className="w-3.5 h-3.5" /> Repository
                      </a>
                    )}
                    {sub.liveDemoUrl && (
                      <a
                        href={sub.liveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-3.5 h-3.5" /> Live Demo
                      </a>
                    )}
                    <span className="text-slate-400">
                      Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {sub.feedback && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                      <span className="font-bold block mb-1">Corporate Reviewer Feedback:</span>
                      {sub.feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Solution Submission Modal */}
        {selectedHackathon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase text-indigo-700">Submit Solution</span>
                  <h3 className="text-base font-bold text-slate-900">{selectedHackathon.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedHackathon(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {feedbackMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitSolution} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Solution Title</label>
                  <input
                    type="text"
                    required
                    value={solutionTitle}
                    onChange={(e) => setSolutionTitle(e.target.value)}
                    placeholder="e.g. Distributed WebSocket State Synchronizer"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Architecture &amp; Approach Description</label>
                  <textarea
                    rows={4}
                    required
                    value={solutionDesc}
                    onChange={(e) => setSolutionDesc(e.target.value)}
                    placeholder="Explain your technical decisions, algorithms chosen, and how you met the published rubric..."
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GitHub Repository Link</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Live Demonstration URL</label>
                  <input
                    type="url"
                    value={liveDemoUrl}
                    onChange={(e) => setLiveDemoUrl(e.target.value)}
                    placeholder="https://my-live-demo.app"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedHackathon(null)}
                    className="px-3 py-1.5 text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Confirm Submission'}
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
