import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_DEMO_HACKATHONS } from '../../firebase/seedData';
import { Hackathon, HackathonSubmission } from '../../types';
import { collection, query, where, getDocs, setDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Code2,
  Plus,
  Calendar,
  Users,
  Award,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Github,
  Globe,
  X,
  FileCheck
} from 'lucide-react';

export const CompanyHackathonsPage: React.FC = () => {
  const { currentUser, companyProfile } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [submissions, setSubmissions] = useState<HackathonSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // New hackathon modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Distributed Systems');
  const [requiredSkills, setRequiredSkills] = useState('React, TypeScript, WebSockets');
  const [eligibility, setEligibility] = useState('Open to enrolled university students and recent graduates.');
  const [deadline, setDeadline] = useState('2026-12-15');
  const [teamSizeMax, setTeamSizeMax] = useState(4);
  const [prizeReward, setPrizeReward] = useState('$5,000 Cash Award + Direct Interview Shortlist');
  const [submitting, setSubmitting] = useState(false);

  // Grading modal
  const [selectedSub, setSelectedSub] = useState<HackathonSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState(85);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchCompanyChallenges = async () => {
    if (!currentUser) return;
    try {
      // 1. Fetch this company's challenges
      const qH = query(
        collection(db, 'hackathons'),
        where('companyId', '==', currentUser.uid)
      );
      const snapH = await getDocs(qH);
      const listH: Hackathon[] = [];
      snapH.forEach((d) => {
        listH.push({ id: d.id, ...(d.data() as any) });
      });

      // Include demo hackathon if empty
      if (listH.length === 0) {
        listH.push(INITIAL_DEMO_HACKATHONS[0]);
      }
      setHackathons(listH);

      // 2. Fetch submissions for this company's hackathons
      const qS = query(
        collection(db, 'hackathonSubmissions'),
        where('companyId', '==', currentUser.uid)
      );
      const snapS = await getDocs(qS);
      const listS: HackathonSubmission[] = [];
      snapS.forEach((d) => {
        listS.push({ id: d.id, ...(d.data() as any) });
      });

      // Sample submission if none
      if (listS.length === 0) {
        listS.push({
          id: 'sub-sample-1',
          hackathonId: INITIAL_DEMO_HACKATHONS[0].id,
          hackathonTitle: INITIAL_DEMO_HACKATHONS[0].title,
          companyId: currentUser.uid,
          candidateUid: 'cand-aarav',
          candidateName: 'Aarav Sharma',
          candidateEmail: 'aarav.sharma@demo.internal',
          solutionTitle: 'CRDT WebSocket State Synchronizer',
          solutionDescription: 'Implemented vector clocks and conflict-free replicated data types with 20ms sync latency under simulated packet drop.',
          githubRepoUrl: 'https://github.com/example/crdt-sync',
          liveDemoUrl: 'https://crdt-demo.internal',
          status: 'submitted',
          submittedAt: new Date().toISOString()
        });
      }
      setSubmissions(listS);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyChallenges();
  }, [currentUser]);

  const handleCreateHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSubmitting(true);
    try {
      const newId = `hack-${currentUser.uid}-${Date.now()}`;
      const skillsArr = requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);

      const newHack: Hackathon = {
        id: newId,
        companyId: currentUser.uid,
        companyName: companyProfile?.companyName || 'Enterprise Partner',
        title: title.trim(),
        problemStatement: problemStatement.trim(),
        description: description.trim(),
        category,
        requiredSkills: skillsArr,
        eligibility: eligibility.trim(),
        teamSizeMax: Number(teamSizeMax),
        startDate: new Date().toISOString().split('T')[0],
        deadline,
        evaluationCriteria: [
          'Correctness & Technical Depth (30%)',
          'Architecture & Feasibility (30%)',
          'User Experience & Design (20%)',
          'Documentation & Demo Completeness (20%)'
        ],
        prizeReward: prizeReward.trim() || undefined,
        allowedFormats: ['GitHub Repository', 'Live Demo URL'],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'hackathons', newId), newHack);
      setHackathons([newHack, ...hackathons]);
      setShowCreateModal(false);
      setNotice('New hackathon challenge published successfully.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      setNotice('Error creating hackathon: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setEvaluating(true);
    try {
      const subRef = doc(db, 'hackathonSubmissions', selectedSub.id);
      await updateDoc(subRef, {
        score: Number(gradeScore),
        feedback: gradeFeedback.trim(),
        status: Number(gradeScore) >= 80 ? 'shortlisted' : 'under_review',
        evaluatedAt: new Date().toISOString()
      });

      setSubmissions(
        submissions.map((s) =>
          s.id === selectedSub.id
            ? { ...s, score: Number(gradeScore), feedback: gradeFeedback.trim(), status: Number(gradeScore) >= 80 ? 'shortlisted' : 'under_review' }
            : s
        )
      );

      setSelectedSub(null);
      setNotice(`Evaluation recorded for ${selectedSub.candidateName}.`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      setNotice('Failed to grade submission: ' + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-900 bg-slate-100 border border-slate-200 mb-2">
              <Code2 className="w-3.5 h-3.5" />
              <span>Enterprise Challenge Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Company Challenges &amp; Technical Problem Statements
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Publish authentic engineering problems, host company challenges, and award verifiable digital badges to high performers.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Challenge</span>
          </button>
        </div>

        {notice && (
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Two Sections: Active Hackathons + Inbound Submissions to Evaluate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Col 1: Published Hackathons */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Your Published Challenges ({hackathons.length})
            </h3>

            {hackathons.map((h) => (
              <div
                key={h.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{h.title}</h4>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {h.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {h.problemStatement}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                  <span>Deadline: {h.deadline}</span>
                  <span>&bull;</span>
                  <span>Max Team: {h.teamSizeMax}</span>
                  {h.prizeReward && <span>&bull; {h.prizeReward}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Col 2: Submissions to Review */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Candidate Submissions to Review ({submissions.length})
            </h3>

            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{sub.solutionTitle}</h4>
                    <p className="text-xs text-slate-500">
                      By {sub.candidateName} &bull; {sub.hackathonTitle}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {sub.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {sub.solutionDescription}
                </p>

                <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
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
                      <Globe className="w-3.5 h-3.5" /> Demo URL
                    </a>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {sub.score ? `Graded: ${sub.score}/100` : 'Pending Review'}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedSub(sub);
                      setGradeScore(sub.score || 85);
                      setGradeFeedback(sub.feedback || '');
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
                  >
                    Grade Rubric &amp; Feedback
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Challenge Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Publish Hackathon Challenge</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateHackathon} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Challenge Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Distributed Consensus Engine Challenge"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Problem Statement</label>
                  <textarea
                    rows={3}
                    required
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    placeholder="Clear summary of the real-world engineering challenge..."
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Detailed Requirements &amp; Scope</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe inputs, test constraints, and deliverables..."
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Deadline</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Max Team Size</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={teamSizeMax}
                      onChange={(e) => setTeamSizeMax(Number(e.target.value))}
                      className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prize / Reward (Optional)</label>
                  <input
                    type="text"
                    value={prizeReward}
                    onChange={(e) => setPrizeReward(e.target.value)}
                    placeholder="e.g. $5,000 Cash + Interview Fast-Track"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-3 py-1.5 text-slate-600">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl">
                    {submitting ? 'Publishing...' : 'Publish Challenge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grading Rubric Modal */}
        {selectedSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Evaluation Rubric</span>
                  <h3 className="text-sm font-bold text-slate-900">{selectedSub.candidateName}</h3>
                </div>
                <button onClick={() => setSelectedSub(null)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGradeSubmission} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rubric Score (0 - 100):</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Constructive Reviewer Feedback:</label>
                  <textarea
                    rows={4}
                    required
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    placeholder="Provide specific notes on architecture, performance, test coverage, and correctness..."
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setSelectedSub(null)} className="px-3 py-1.5 text-slate-600">
                    Cancel
                  </button>
                  <button type="submit" disabled={evaluating} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl">
                    {evaluating ? 'Recording...' : 'Release Score & Feedback'}
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
