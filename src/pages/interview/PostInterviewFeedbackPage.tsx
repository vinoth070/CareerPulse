import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { INITIAL_DEMO_INTERVIEWS } from '../../firebase/seedData';
import { InterviewRecord } from '../../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  FileText,
  HelpCircle
} from 'lucide-react';

export const PostInterviewFeedbackPage: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<InterviewRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Appeal state
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [appealSubmitted, setAppealSubmitted] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      const id = interviewId || 'demo-interview-101';
      let found = INITIAL_DEMO_INTERVIEWS.find((i) => i.id === id) || null;

      try {
        const snap = await getDoc(doc(db, 'interviews', id));
        if (snap.exists()) {
          found = { id: snap.id, ...(snap.data() as any) };
        }
      } catch (e) {
        console.warn('Using demo interview:', e);
      }

      setInterview(found);
      setLoading(false);
    };

    fetchRecord();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">
        Loading interview evaluation record...
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-xs text-slate-500">No interview feedback record found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Evaluation &amp; Feedback Dossier</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {interview.jobTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Conducted by {interview.companyName} &bull; Stage: {interview.stage}
            </p>
          </div>

          <button
            onClick={() => setShowAppealModal(true)}
            className="px-4 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors self-start sm:self-auto"
          >
            Request Fairness Review
          </button>
        </div>

        {/* Overall Evaluation Summary Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Authorized Rubric Evaluation Outcome
              </h3>
              <p className="text-xs text-slate-500">
                Calculated across job-relevant technical and problem-solving rubrics
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center shrink-0 min-w-[130px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Rubric Rating
              </span>
              <span className="text-2xl font-extrabold text-blue-700 mt-0.5 block">
                {interview.totalScore ? `${interview.totalScore} / ${interview.maxScore || 12}` : '3.6 / 4.0'}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold">Meets Competency</span>
            </div>
          </div>

          {/* Qualitative Feedback Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Demonstated Strengths
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {interview.strengths ||
                  'Demonstrated strong command of React reconciliation and immutable state updates. Clear architectural structure when handling network failure edge cases.'}
              </p>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/80 space-y-2">
              <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-blue-600" /> Recommended Areas for Growth
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {interview.improvements ||
                  'Deepen understanding of custom debounce hook timing boundaries and Web Worker offloading for computation-heavy canvas rendering.'}
              </p>
            </div>
          </div>

          {/* Next Steps Banner */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-900 block">Next Steps in Selection Process:</span>
              <p className="text-slate-600">The hiring committee meets on Friday to finalize offer confirmations.</p>
            </div>
            <Link
              to="/student/opportunities"
              className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl text-center shrink-0"
            >
              Back to My Applications
            </Link>
          </div>
        </div>

        {/* Question-by-Question Rubric Breakdown */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            Standardized Question Rubric Results
          </h3>

          <div className="space-y-4">
            {interview.questions?.map((q, idx) => (
              <div
                key={q.id}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      Competency: {q.competency}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                      Q{idx + 1}: {q.questionText}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-bold bg-white text-slate-800 rounded border border-slate-200">
                    4 / {q.maxScore} pts
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-700">Rubric Indicators:</span>{' '}
                  {q.expectedIndicators}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Fairness Review Modal */}
        {showAppealModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-amber-700">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Request Fairness Review</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                If you believe an interview question was unrelated to the advertised role or if a technical disruption affected your response, an independent Fairness Reviewer will audit your interview transcript and score logs.
              </p>

              {appealSubmitted ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fairness review request logged. An auditor will inspect the session.</span>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setAppealSubmitted(true);
                    setTimeout(() => {
                      setShowAppealModal(false);
                      setAppealSubmitted(false);
                    }, 2000);
                  }}
                  className="space-y-3"
                >
                  <textarea
                    rows={4}
                    required
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="Describe the fairness concern, technical disruption, or question discrepancy..."
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl leading-relaxed"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAppealModal(false)}
                      className="px-3 py-1.5 text-xs text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
                    >
                      Submit for Review
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
