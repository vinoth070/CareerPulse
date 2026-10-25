import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_DEMO_INTERVIEWS, INITIAL_DEMO_JOBS } from '../../firebase/seedData';
import { InterviewRecord, InterviewQuestionConfig } from '../../types';
import { collection, query, where, getDocs, setDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Link } from 'react-router-dom';
import {
  Video,
  Calendar,
  Clock,
  User,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Star,
  ExternalLink,
  HelpCircle,
  X,
  ShieldCheck,
  Building2,
  Send,
  MessageSquare
} from 'lucide-react';

export const CompanyInterviewsPage: React.FC = () => {
  const { currentUser, companyProfile } = useAuth();
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // New Interview Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidateUid, setCandidateUid] = useState('cand-demo-1');
  const [jobTitle, setJobTitle] = useState('Frontend Engineer (React / TypeScript)');
  const [stage, setStage] = useState<InterviewRecord['stage']>('Technical Round 1');
  const [scheduledDate, setScheduledDate] = useState('2026-11-05');
  const [scheduledTime, setScheduledTime] = useState('14:00 UTC');
  const [questions, setQuestions] = useState<InterviewQuestionConfig[]>([
    {
      id: 'q-live-1',
      questionText: 'Explain how you optimize re-renders in a high-frequency telemetry dashboard with React and WebSockets.',
      competency: 'Frontend Architecture & Rendering Lifecycle',
      expectedIndicators: 'Mentions memoization, useMemo/useCallback, virtual windowing, immutable data, and selective state updates.',
      maxScore: 4
    },
    {
      id: 'q-live-2',
      questionText: 'Design a distributed rate limiter for a public REST and GraphQL API gateway.',
      competency: 'System Architecture & Concurrency',
      expectedIndicators: 'Analyzes token bucket / leaky bucket algorithm, Redis atomic counters, latency implications, and sliding window logs.',
      maxScore: 4
    }
  ]);
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  // Evaluation / Grading Modal
  const [evaluatingInterview, setEvaluatingInterview] = useState<InterviewRecord | null>(null);
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [releaseFeedback, setReleaseFeedback] = useState(true);
  const [savingEvaluation, setSavingEvaluation] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchInterviews = async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, 'interviews'),
        where('companyId', '==', currentUser.uid)
      );
      const snap = await getDocs(q);
      const list: InterviewRecord[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as any) });
      });

      if (list.length === 0) {
        // Fallback to seeded demo interviews
        list.push(...INITIAL_DEMO_INTERVIEWS);
      }
      setInterviews(list);
    } catch (e) {
      console.error('Error fetching interviews:', e);
      setInterviews(INITIAL_DEMO_INTERVIEWS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [currentUser]);

  const openScheduleModal = () => {
    setCandidateName('');
    setCandidateEmail('');
    setCandidateUid(`cand-${Date.now().toString(36)}`);
    setShowScheduleModal(true);
  };

  const handleAddQuestion = () => {
    const newQ: InterviewQuestionConfig = {
      id: `q-custom-${Date.now()}`,
      questionText: '',
      competency: 'General Technical Problem Solving',
      expectedIndicators: 'Clear articulation of assumptions, edge cases, and algorithmic complexity.',
      maxScore: 4
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: keyof InterviewQuestionConfig, val: any) => {
    const updated = [...questions];
    (updated[idx] as any)[field] = val;
    setQuestions(updated);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmittingSchedule(true);
    setNotice(null);

    const interviewId = `int-${Date.now()}`;
    const newInterview: InterviewRecord = {
      id: interviewId,
      applicationId: `app-${Date.now()}`,
      jobId: 'job-global-1',
      jobTitle,
      companyId: currentUser.uid,
      companyName: companyProfile?.companyName || 'Enterprise Recruiter',
      candidateUid,
      candidateName,
      candidateEmail,
      scheduledDate,
      scheduledTime,
      stage,
      status: 'scheduled',
      questions,
      candidateResponses: {},
      feedbackReleased: false,
      maxScore: questions.length * 4,
      totalScore: 0,
      logs: [
        {
          timestamp: new Date().toISOString(),
          eventType: 'session_joined',
          details: 'Interview scheduled by company recruitment team with standard rubric.'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'interviews', interviewId), newInterview);
      setInterviews((prev) => [newInterview, ...prev]);
      setShowScheduleModal(false);
      setNotice('Interview scheduled successfully. Candidate room URL is active.');
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      console.warn('Saved locally:', err);
      setInterviews((prev) => [newInterview, ...prev]);
      setShowScheduleModal(false);
      setNotice('Interview scheduled locally.');
      setTimeout(() => setNotice(null), 4000);
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const openEvaluationModal = (item: InterviewRecord) => {
    setEvaluatingInterview(item);
    const initialRubric: Record<string, number> = {};
    item.questions.forEach((q) => {
      initialRubric[q.id] = item.rubricScores?.[q.id] ?? 3;
    });
    setRubricScores(initialRubric);
    setReviewerNotes(item.reviewerNotes || '');
    setStrengths(item.strengths || 'Strong grasp of foundational principles, concise communication.');
    setImprovements(item.improvements || 'Could provide deeper consideration of high-throughput caching and rollback strategies.');
    setReleaseFeedback(item.feedbackReleased ?? true);
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingInterview) return;
    setSavingEvaluation(true);

    const totalScored = Object.values(rubricScores).reduce((acc, v) => acc + v, 0);
    const maxPossible = evaluatingInterview.questions.length * 4;

    const updates: Partial<InterviewRecord> = {
      status: 'completed',
      rubricScores,
      totalScore: totalScored,
      maxScore: maxPossible,
      reviewerNotes,
      strengths,
      improvements,
      feedbackReleased: releaseFeedback,
      updatedAt: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'interviews', evaluatingInterview.id), updates);
    } catch (err) {
      console.warn('Evaluation updated locally:', err);
    }

    setInterviews((prev) =>
      prev.map((item) =>
        item.id === evaluatingInterview.id ? ({ ...item, ...updates } as InterviewRecord) : item
      )
    );

    setEvaluatingInterview(null);
    setSavingEvaluation(false);
    setNotice('Standardized rubric evaluation saved and feedback released.');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Online Technical Interviews
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Live Evaluation & Rubrics
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Conduct in-platform video/coding interviews, define job-aligned question rubrics, evaluate candidates, and publish structured feedback.
          </p>
        </div>
        <button
          onClick={openScheduleModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Schedule Interview
        </button>
      </div>

      {notice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Info notice about fair interviews */}
      <div className="mb-6 p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Standardized Rubrics & Fairness Oversight: </span>
          All interviews on CareerPulse adhere to consistent 0–4 competency scoring. Questions are vetted to eliminate demographic bias, and independent reviewers audit session logs to guarantee equitable hiring opportunities.
        </div>
      </div>

      {/* Interviews Table / Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No Interviews Scheduled</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Schedule an online interview with shortlisted applicants to evaluate technical problem-solving live.
          </p>
          <button
            onClick={openScheduleModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Schedule Interview
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => {
            const hasScore = typeof item.totalScore === 'number' && item.totalScore > 0;
            const scorePct =
              hasScore && typeof item.totalScore === 'number' && item.maxScore
                ? Math.round((item.totalScore / item.maxScore) * 100)
                : null;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col lg:flex-row justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {item.stage}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider ${
                        item.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                    {item.feedbackReleased && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        Feedback Released
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{item.candidateName}</h3>
                    <p className="text-xs text-slate-500">{item.candidateEmail}</p>
                    <p className="text-sm font-medium text-blue-900 mt-1 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Role: {item.jobTitle}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date: {item.scheduledDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Time: {item.scheduledTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" /> {item.questions.length} Rubric Questions
                    </span>
                  </div>

                  {/* Rubric Score preview if evaluated */}
                  {scorePct !== null && (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Total Score:</span>
                        <span className="font-extrabold text-blue-700 text-sm">
                          {item.totalScore} / {item.maxScore} ({scorePct}%)
                        </span>
                      </div>
                      {item.strengths && (
                        <p className="w-full text-slate-600 italic">
                          "{item.strengths}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions & Room Links */}
                <div className="flex lg:flex-col justify-end lg:justify-center items-end gap-2.5 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 shrink-0">
                  <Link
                    to={`/interview/${item.id}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all w-full sm:w-auto text-center"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Enter Live Room
                  </Link>

                  <button
                    onClick={() => openEvaluationModal(item)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors w-full sm:w-auto"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    {item.status === 'completed' ? 'Edit Evaluation' : 'Grade with Rubric'}
                  </button>

                  <Link
                    to={`/interview/${item.id}/feedback`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Feedback Page
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Schedule New Interview */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Schedule Online Interview</h2>
                <p className="text-xs text-slate-500">
                  Select candidate, choose assessment stage, and configure question evaluation rubrics.
                </p>
              </div>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Priya Nair"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Candidate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="priya.nair@university.edu"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Target Job Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Interview Stage *
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Technical Round 1">Technical Round 1</option>
                    <option value="System Architecture">System Architecture</option>
                    <option value="Live Coding">Live Coding</option>
                    <option value="Problem Solving">Problem Solving</option>
                    <option value="Final HR">Final HR & Values</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    placeholder="14:00 UTC / 10:00 AM EST"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Rubric Questions */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Standardized Rubric Questions ({questions.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700">Question #{idx + 1}</span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="text-slate-400 hover:text-rose-600 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={q.questionText}
                        onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)}
                        placeholder="Enter the question statement..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={q.competency}
                          onChange={(e) => handleQuestionChange(idx, 'competency', e.target.value)}
                          placeholder="Competency area"
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          value={q.expectedIndicators}
                          onChange={(e) => handleQuestionChange(idx, 'expectedIndicators', e.target.value)}
                          placeholder="Expected indicators (4/4)"
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSchedule}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm disabled:opacity-50"
                >
                  {submittingSchedule ? 'Scheduling...' : 'Confirm & Generate Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Evaluate Candidate with Rubric */}
      {evaluatingInterview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEvaluatingInterview(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Grade Interview: {evaluatingInterview.candidateName}
                </h2>
                <p className="text-xs text-slate-500">
                  Role: {evaluatingInterview.jobTitle} • {evaluatingInterview.stage}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-5">
              {/* Question Rubric Grading */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Competency Rubric Scoring (0 to 4 Scale)
                </h3>
                {evaluatingInterview.questions.map((q, idx) => {
                  const currentScore = rubricScores[q.id] ?? 3;
                  const responseDraft = evaluatingInterview.candidateResponses?.[q.id];
                  return (
                    <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          Q{idx + 1}: {q.questionText}
                        </span>
                        <span className="text-xs font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
                          {currentScore} / 4 pts
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">Target Competency:</span> {q.competency}
                      </p>
                      {responseDraft && (
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 font-mono">
                          <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
                            Candidate's Submitted Answer / Code:
                          </span>
                          {responseDraft}
                        </div>
                      )}
                      <div className="pt-2 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-500">
                          0 = Needs Dev | 1 = Basic | 2 = Competent | 3 = Proficient | 4 = Mastered
                        </div>
                        <div className="flex gap-1.5">
                          {[0, 1, 2, 3, 4].map((pt) => (
                            <button
                              key={pt}
                              type="button"
                              onClick={() => setRubricScores({ ...rubricScores, [q.id]: pt })}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                currentScore === pt
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {pt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Demonstrated Strengths *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Areas for Growth & Improvement *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Private Interviewer Notes (Confidential)
                </label>
                <textarea
                  rows={2}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Notes for internal hiring committee deliberation..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Release Feedback Checkbox */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-900">Release Feedback Report to Candidate</p>
                  <p className="text-[11px] text-blue-700">
                    Permits the candidate to inspect rubric scores and constructive growth feedback on their dashboard.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={releaseFeedback}
                  onChange={(e) => setReleaseFeedback(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEvaluatingInterview(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEvaluation}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm disabled:opacity-50"
                >
                  {savingEvaluation ? 'Saving...' : 'Finalize & Submit Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
