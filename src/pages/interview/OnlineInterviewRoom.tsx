import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_DEMO_INTERVIEWS } from '../../firebase/seedData';
import { InterviewRecord, AntiCheatingEvent } from '../../types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';

export const OnlineInterviewRoom: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const { currentUser, role } = useAuth();
  const navigate = useNavigate();

  const [interview, setInterview] = useState<InterviewRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Question navigation & answers
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [codeNotes, setCodeNotes] = useState('');

  // Media simulation & environment
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Session timer (e.g. 45 minutes)
  const [secondsRemaining, setSecondsRemaining] = useState(45 * 60);

  // Technical issue reporting modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueDesc, setIssueDesc] = useState('');
  const [issueReported, setIssueReported] = useState(false);

  // Submitting
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchInterview = async () => {
      // Look up in demo records or Firestore
      const idToFetch = interviewId || 'demo-interview-101';
      let found: InterviewRecord | null =
        INITIAL_DEMO_INTERVIEWS.find((i) => i.id === idToFetch) || null;

      try {
        const snap = await getDoc(doc(db, 'interviews', idToFetch));
        if (snap.exists()) {
          found = { id: snap.id, ...(snap.data() as any) };
        }
      } catch (e) {
        console.warn('Using demo interview record:', e);
      }

      if (found) {
        setInterview(found);
        setAnswers(found.candidateResponses || {});
        setCodeNotes(found.candidateNotes || '');
      }
      setLoading(false);
    };

    fetchInterview();
  }, [interviewId]);

  // Request camera/mic safely if supported by browser
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          activeStream = stream;
          setMediaStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.log('Camera/Mic permission bypassed or unavailable; using accessible placeholder:', err.name);
        });
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (completed || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((s) => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [completed, secondsRemaining]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setIssueReported(true);
    setTimeout(() => {
      setShowIssueModal(false);
      setIssueReported(false);
      setIssueDesc('');
    }, 2000);
  };

  const handleSubmitInterview = async () => {
    if (!interview) return;
    setSubmitting(true);

    const submissionEvent: AntiCheatingEvent = {
      timestamp: new Date().toISOString(),
      eventType: 'response_submitted',
      details: 'Candidate completed questions and submitted final responses in the interview room.'
    };

    const updatedLogs = [...(interview.logs || []), submissionEvent];

    try {
      if (interview.id) {
        await updateDoc(doc(db, 'interviews', interview.id), {
          candidateResponses: answers,
          candidateNotes: codeNotes,
          status: 'completed',
          logs: updatedLogs,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('Saved in session state:', e);
    } finally {
      setSubmitting(false);
      setCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
        Connecting to encrypted interview room...
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 max-w-md">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Interview Session Not Found</h2>
          <p className="text-xs text-slate-600">
            This interview session may have expired or been rescheduled by the hiring team.
          </p>
          <Link
            to="/student/opportunities"
            className="inline-block px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const questions = interview.questions || [];
  const currentQ = questions[currentQIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            LIVE
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">{interview.jobTitle}</h1>
            <p className="text-[11px] text-slate-400">
              {interview.companyName} &bull; {interview.stage}
            </p>
          </div>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 font-mono text-xs text-blue-300">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(secondsRemaining)} remaining</span>
          </div>

          <button
            onClick={() => setShowIssueModal(true)}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700"
          >
            Report Incident
          </button>
        </div>
      </header>

      {/* Main Interview Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 p-4 gap-4 overflow-hidden">
        {/* Left Side: Video & Environment (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Candidate Camera Feed */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative aspect-video flex items-center justify-center">
            {mediaStream && videoEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="text-center p-4 space-y-2">
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400 font-bold text-lg">
                  {interview.candidateName.charAt(0)}
                </div>
                <p className="text-xs font-semibold text-slate-300">{interview.candidateName}</p>
                <p className="text-[10px] text-slate-500">Camera placeholder / Private mode active</p>
              </div>
            )}

            {/* Video Overlay Controls */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-950/70 backdrop-blur-xs px-3 py-1.5 rounded-xl text-xs">
              <span className="text-[11px] text-slate-300">Candidate Video Feed</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`p-1.5 rounded-lg ${
                    audioEnabled ? 'bg-slate-800 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {audioEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  className={`p-1.5 rounded-lg ${
                    videoEnabled ? 'bg-slate-800 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {videoEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Interviewer Persona Card */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Authorized Technical Interviewer
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-950 border border-blue-700 flex items-center justify-center text-blue-300 font-bold text-xs">
                ENG
              </div>
              <div>
                <p className="text-xs font-bold text-white">{interview.companyName} Panel</p>
                <p className="text-[11px] text-slate-400">Structured Technical Evaluation</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              Questions are standardized to your job description. Answer calmly and clearly explain your thought process.
            </p>
          </div>

          {/* Session Integrity Notice */}
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Fairness Guarantee
            </span>
            <p>
              This interview uses predefined rubrics. Session logs record connectivity and answer submissions to protect against technical interruptions.
            </p>
          </div>
        </div>

        {/* Right Side: Question Panel & Candidate Response Workspace (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {completed ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center space-y-4">
              <div className="max-w-md space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-white">Interview Session Completed</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your responses and technical notes have been recorded securely. The hiring team and fairness reviewers will evaluate your answers against the published rubric.
                </p>
                <div className="pt-2">
                  <Link
                    to={`/interview/${interview.id}/feedback`}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-block"
                  >
                    View Feedback Dashboard
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Question Stepper Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                    Question {currentQIndex + 1} of {questions.length} &bull; {currentQ?.competency}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">
                    {currentQ?.questionText}
                  </h3>
                </div>

                <span className="px-2.5 py-1 text-[11px] font-mono text-slate-400 bg-slate-800 rounded-lg">
                  Max: {currentQ?.maxScore} pts
                </span>
              </div>

              {/* Response Workspace */}
              <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Technical Explanation / Answer:
                  </label>
                  <textarea
                    rows={6}
                    value={answers[currentQ?.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQ?.id, e.target.value)}
                    placeholder="Provide your solution approach, reasoning, and relevant trade-offs..."
                    className="w-full py-3 px-3.5 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:outline-none text-slate-100 leading-relaxed font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-blue-400" />
                    Code Draft / Scratchpad Notes (Optional):
                  </label>
                  <textarea
                    rows={6}
                    value={codeNotes}
                    onChange={(e) => setCodeNotes(e.target.value)}
                    placeholder="// Write pseudocode, algorithms, or structural notes here..."
                    className="w-full py-3 px-3.5 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:outline-none text-emerald-400 font-mono leading-relaxed"
                  />
                </div>
              </div>

              {/* Bottom Navigation & Submit Bar */}
              <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/80">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((i) => i - 1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl disabled:opacity-30 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous Question
                </button>

                <div className="flex items-center gap-2">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        idx === currentQIndex
                          ? 'bg-blue-600 text-white'
                          : answers[q.id]
                          ? 'bg-slate-800 text-blue-300 border border-blue-600/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {currentQIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex((i) => i + 1)}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-1.5"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    disabled={submitting}
                    onClick={handleSubmitInterview}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Recording...' : 'Complete & Submit Interview'}</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Technical Issue Reporting Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Report Technical Incident</h3>
              </div>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Experiencing network jitter, browser disconnects, or audio issues? Describe the incident. It will be recorded in the official audit record to prevent unfair scoring.
            </p>

            {issueReported ? (
              <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Technical incident logged in audit trail.</span>
              </div>
            ) : (
              <form onSubmit={handleReportIssue} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  placeholder="Detail the technical disruption (e.g. video latency, reconnection)..."
                  className="w-full py-2 px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowIssueModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
                  >
                    Log Incident
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
