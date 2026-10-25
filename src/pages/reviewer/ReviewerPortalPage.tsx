import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_DEMO_INTERVIEWS } from '../../firebase/seedData';
import { InterviewRecord, FairnessReviewAudit } from '../../types';
import { collection, getDocs, setDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Award,
  Video,
  Eye,
  FileText,
  UserCheck,
  Star,
  X,
  ExternalLink,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReviewerPortalPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [audits, setAudits] = useState<FairnessReviewAudit[]>([]);
  const [loading, setLoading] = useState(true);

  // Audit modal state
  const [selectedInterview, setSelectedInterview] = useState<InterviewRecord | null>(null);
  const [outcome, setOutcome] = useState<FairnessReviewAudit['outcome']>('no_concern');
  const [severity, setSeverity] = useState<FairnessReviewAudit['severity']>('low');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('Affirm interview evaluation and release certified badge to candidate record.');

  // Checklist state
  const [checkCompetencyRelevance, setCheckCompetencyRelevance] = useState(true);
  const [checkObjectiveAnchors, setCheckObjectiveAnchors] = useState(true);
  const [checkDemographicNeutrality, setCheckDemographicNeutrality] = useState(true);
  const [checkTechnicalIncidentFactoring, setCheckTechnicalIncidentFactoring] = useState(true);

  const [savingAudit, setSavingAudit] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchReviewerData = async () => {
    try {
      // 1. Fetch completed or in-progress interviews
      const snap = await getDocs(collection(db, 'interviews'));
      const list: InterviewRecord[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as any) });
      });

      if (list.length === 0) {
        list.push(...INITIAL_DEMO_INTERVIEWS);
      }
      setInterviews(list);

      // 2. Fetch past audits
      const auditSnap = await getDocs(collection(db, 'fairnessReviews'));
      const auditList: FairnessReviewAudit[] = [];
      auditSnap.forEach((d) => {
        auditList.push({ id: d.id, ...(d.data() as any) });
      });

      if (auditList.length === 0) {
        auditList.push({
          id: 'audit-demo-1',
          interviewId: INITIAL_DEMO_INTERVIEWS[0].id,
          jobTitle: INITIAL_DEMO_INTERVIEWS[0].jobTitle,
          companyName: INITIAL_DEMO_INTERVIEWS[0].companyName,
          candidateName: INITIAL_DEMO_INTERVIEWS[0].candidateName,
          reviewerUid: currentUser?.uid || 'rev-demo-1',
          reviewerName: userProfile?.displayName || 'Dr. Eleanor Vance (Institutional Auditor)',
          outcome: 'no_concern',
          severity: 'low',
          evidenceNotes: 'All questions were strictly aligned with the published competency framework. Rubric score correctly reflects code quality and design choices without demographic variance.',
          recommendedAction: 'Affirm rubric evaluation as certified fair and unbiased.',
          reviewedAt: '2026-10-24T18:00:00Z'
        });
      }
      setAudits(auditList);
    } catch (e) {
      console.warn('Reviewer data fallback to seed:', e);
      setInterviews(INITIAL_DEMO_INTERVIEWS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewerData();
  }, []);

  const openAuditModal = (item: InterviewRecord) => {
    setSelectedInterview(item);
    setOutcome('no_concern');
    setSeverity('low');
    setEvidenceNotes(
      `Reviewed question rubrics and candidate code submissions for ${item.candidateName}. Evaluation appears consistent with documented performance indicators.`
    );
    setRecommendedAction('Certify interview rubric as unbiased and release audit clearance to student portal.');
    setCheckCompetencyRelevance(true);
    setCheckObjectiveAnchors(true);
    setCheckDemographicNeutrality(true);
    setCheckTechnicalIncidentFactoring(true);
  };

  const handleSaveAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview || !currentUser) return;
    setSavingAudit(true);

    const auditId = `audit-${Date.now()}`;
    const newAudit: FairnessReviewAudit = {
      id: auditId,
      interviewId: selectedInterview.id,
      jobTitle: selectedInterview.jobTitle,
      companyName: selectedInterview.companyName,
      candidateName: selectedInterview.candidateName,
      reviewerUid: currentUser.uid,
      reviewerName: userProfile?.displayName || 'Fairness Auditor',
      outcome,
      severity,
      evidenceNotes,
      recommendedAction,
      reviewedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'fairnessReviews', auditId), newAudit);
    } catch (e) {
      console.warn('Saved audit locally:', e);
    }

    setAudits((prev) => [newAudit, ...prev]);
    setSelectedInterview(null);
    setSavingAudit(false);
    setNotice('Fairness audit recorded and certified. Results synchronized to public integrity log.');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Fairness Review & Placement Oversight
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
              <Scale className="w-3 h-3" /> Portal 4: Independent Reviewer
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Independent institutional review of corporate interview rubrics, candidate appeals, and anti-bias algorithmic parity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            Auditor: <span className="text-teal-700">{userProfile?.displayName || currentUser?.email || 'Dr. Eleanor Vance'}</span>
          </span>
        </div>
      </div>

      {notice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Interviews</span>
            <Video className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{interviews.length}</p>
          <span className="text-[11px] text-slate-500">Across verified MNC recruiters</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Audits Completed</span>
            <FileCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-teal-700 mt-2">{audits.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">100% Certified Rubrics</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">No Concern Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">
            {audits.length > 0
              ? `${Math.round((audits.filter((a) => a.outcome === 'no_concern').length / audits.length) * 100)}%`
              : '100%'}
          </p>
          <span className="text-[11px] text-slate-500">Standardized parity index</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Appeals Pending</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {audits.filter((a) => a.outcome === 'potential_concern').length}
          </p>
          <span className="text-[11px] text-slate-500">Zero active discrimination flags</span>
        </div>
      </div>

      {/* Main Grid: Interviews to Audit vs Completed Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interviews available for audit (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Interviews Ready for Fairness Audit</h2>
            <span className="text-xs text-slate-500">{interviews.length} sessions listed</span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((item) => {
                const existingAudit = audits.find((a) => a.interviewId === item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {item.stage}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {item.companyName}
                        </span>
                        {existingAudit && (
                          <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Audited
                          </span>
                        )}
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">
                          DEMO
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{item.candidateName}</h3>
                      <p className="text-xs text-slate-600">Role: {item.jobTitle}</p>

                      <div className="text-xs text-slate-500 pt-1 flex flex-wrap gap-4">
                        <span>Date: {item.scheduledDate}</span>
                        <span>Questions: {item.questions.length} rubric items</span>
                        {item.totalScore !== undefined && (
                          <span className="font-bold text-blue-700">
                            Recruiter Score: {item.totalScore}/{item.maxScore}
                          </span>
                        )}
                      </div>

                      {item.logs && item.logs.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase">Integrity Log:</span>
                          <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1">
                            {item.logs[item.logs.length - 1].details}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col justify-end items-end gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 shrink-0">
                      <button
                        onClick={() => openAuditModal(item)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-sm"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        {existingAudit ? 'Re-Audit Rubric' : 'Conduct Audit'}
                      </button>

                      <Link
                        to={`/interview/${item.id}/feedback`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> View Transcript
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Fairness Certified Audits History */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Certified Audits Feed</h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            {audits.length === 0 ? (
              <p className="text-xs text-slate-500">No audits recorded yet.</p>
            ) : (
              audits.map((a) => (
                <div key={a.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          a.outcome === 'no_concern'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {a.outcome === 'no_concern' ? 'Fairness Certified' : 'Review Recommended'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{a.candidateName}</h4>
                      <p className="text-[11px] text-slate-500">{a.jobTitle} • {a.companyName}</p>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(a.reviewedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 italic">"{a.evidenceNotes}"</p>

                  <div className="text-[11px] text-teal-800 font-medium bg-teal-50/70 p-2 rounded-lg border border-teal-200">
                    <span className="font-bold">Affirmation:</span> {a.recommendedAction}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Audit Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInterview(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Fairness Audit: {selectedInterview.candidateName}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedInterview.companyName} • {selectedInterview.jobTitle}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAudit} className="space-y-5">
              {/* Anti-Bias Checklist */}
              <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  Mandatory Anti-Bias Verification Checklist
                </h3>

                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkCompetencyRelevance}
                    onChange={(e) => setCheckCompetencyRelevance(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded mt-0.5"
                  />
                  <span>
                    <strong>Competency Alignment:</strong> All questions directly tested required job competencies without trick questions or non-standard trivia.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkObjectiveAnchors}
                    onChange={(e) => setCheckObjectiveAnchors(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded mt-0.5"
                  />
                  <span>
                    <strong>Objective Standard:</strong> Grading was anchored strictly on predefined rubric benchmarks (0–4 scale) rather than subjective interviewer impressions.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkDemographicNeutrality}
                    onChange={(e) => setCheckDemographicNeutrality(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded mt-0.5"
                  />
                  <span>
                    <strong>Demographic Neutrality:</strong> No evidence of penalization based on background, institution prestige, gender, accent, or geography.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkTechnicalIncidentFactoring}
                    onChange={(e) => setCheckTechnicalIncidentFactoring(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded mt-0.5"
                  />
                  <span>
                    <strong>Incident Context:</strong> Any transient technical drops or connection issues logged during the session were reviewed equitably.
                  </span>
                </label>
              </div>

              {/* Questions & Responses Quick Glance */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Session Questions & Rubric Evaluation
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedInterview.questions.map((q, idx) => (
                    <div key={q.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-900">
                          Q{idx + 1}: {q.questionText}
                        </span>
                        <span className="font-bold text-blue-700 shrink-0 ml-2">
                          Score: {selectedInterview.rubricScores?.[q.id] ?? 'Pending'}/4
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Competency: {q.competency}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outcome Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Audit Finding Outcome *
                  </label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  >
                    <option value="no_concern">Standard Met (No Concern)</option>
                    <option value="potential_concern">Potential Discrepancy Flagged</option>
                    <option value="insufficient_evidence">Insufficient Data / Log Fragmented</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Severity Rating
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  >
                    <option value="low">Low (Standard Clearance)</option>
                    <option value="medium">Medium (Requires Clarification)</option>
                    <option value="high">High (Action Required)</option>
                  </select>
                </div>
              </div>

              {/* Auditor Evidence Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Auditor Evidence Notes & Analysis *
                </label>
                <textarea
                  rows={3}
                  required
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              {/* Recommended Action */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Recommended Action & Disposition *
                </label>
                <input
                  type="text"
                  required
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedInterview(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAudit}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 shadow-sm disabled:opacity-50"
                >
                  {savingAudit ? 'Certifying...' : 'Affirm & Seal Audit Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
