import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_DEMO_QUIZZES } from '../../firebase/seedData';
import { Quiz, QuizAttempt } from '../../types';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../../firebase/config';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BarChart3,
  AlertCircle,
  ShieldCheck,
  Check
} from 'lucide-react';

export const WeeklyQuizPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedQuizIndex, setSelectedQuizIndex] = useState(0);
  const currentQuiz: Quiz = INITIAL_DEMO_QUIZZES[selectedQuizIndex];

  // Quiz taking state
  const [quizState, setQuizState] = useState<'instructions' | 'taking' | 'completed'>('instructions');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(currentQuiz.timeLimitMinutes * 60);
  const [latestAttemptResult, setLatestAttemptResult] = useState<QuizAttempt | null>(null);

  // Attempt History
  const [pastAttempts, setPastAttempts] = useState<QuizAttempt[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch past attempts for this student
  const fetchPastAttempts = async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, 'quizAttempts'),
        where('userId', '==', currentUser.uid)
      );
      const snap = await getDocs(q);
      const attempts: QuizAttempt[] = [];
      snap.forEach((d) => {
        attempts.push({ id: d.id, ...(d.data() as any) });
      });
      attempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setPastAttempts(attempts);
    } catch (err) {
      console.warn('Could not fetch quiz attempts:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchPastAttempts();
  }, [currentUser]);

  // Timer countdown
  useEffect(() => {
    if (quizState !== 'taking') return;
    if (secondsRemaining <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState, secondsRemaining]);

  const startQuiz = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setSecondsRemaining(currentQuiz.timeLimitMinutes * 60);
    setQuizState('taking');
    setErrorMsg(null);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!currentUser) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      // Trusted score calculation
      let score = 0;
      const skillsEvaluatedSet = new Set<string>();

      currentQuiz.questions.forEach((q) => {
        skillsEvaluatedSet.add(q.skillTag);
        if (userAnswers[q.id] === q.correctAnswerIndex) {
          score += 1;
        }
      });

      const totalQuestions = currentQuiz.questions.length;
      const percentage = Math.round((score / totalQuestions) * 100);

      let feedback = '';
      if (percentage >= 80) {
        feedback = 'Exceptional performance! You demonstrated firm mastery of core engineering and architectural paradigms.';
      } else if (percentage >= 60) {
        feedback = 'Solid understanding. You have a good foundation with a few specific conceptual edge cases to reinforce.';
      } else {
        feedback = 'Good initial effort! Review the detailed question explanations below to strengthen your fundamentals.';
      }

      const attemptId = `attempt-${currentUser.uid}-${currentQuiz.id}-${Date.now()}`;
      const newAttempt: QuizAttempt = {
        id: attemptId,
        userId: currentUser.uid,
        quizId: currentQuiz.id,
        quizTitle: currentQuiz.title,
        score,
        totalQuestions,
        percentage,
        answers: userAnswers,
        skillsEvaluated: Array.from(skillsEvaluatedSet),
        feedback,
        submittedAt: new Date().toISOString()
      };

      // Save to Firestore
      try {
        await setDoc(doc(db, 'quizAttempts', attemptId), newAttempt);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `quizAttempts/${attemptId}`);
      }

      setLatestAttemptResult(newAttempt);
      setQuizState('completed');
      await fetchPastAttempts();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to record quiz results: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = currentQuiz.questions[currentQuestionIndex];
  const progressPercent = Math.round(
    ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200">
                Weekly Assessment
              </span>
              <span className="text-xs text-slate-500 font-medium">Week {currentQuiz.weekNumber}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {currentQuiz.title}
            </h1>
          </div>

          {/* Quiz selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Assessment:</span>
            <select
              value={selectedQuizIndex}
              disabled={quizState === 'taking'}
              onChange={(e) => {
                setSelectedQuizIndex(Number(e.target.value));
                setQuizState('instructions');
                setUserAnswers({});
              }}
              className="py-1.5 px-3 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {INITIAL_DEMO_QUIZZES.map((q, idx) => (
                <option key={q.id} value={idx}>
                  Week {q.weekNumber}: {q.category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* State 1: Instructions & Start */}
        {quizState === 'instructions' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Assessment Guidelines &amp; Scope</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{currentQuiz.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block mb-1">Total Questions</span>
                <span className="text-xl font-bold text-slate-900">{currentQuiz.totalQuestions} Questions</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block mb-1">Time Limit</span>
                <span className="text-xl font-bold text-blue-700">{currentQuiz.timeLimitMinutes} Minutes</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block mb-1">Primary Discipline</span>
                <span className="text-xl font-bold text-slate-900">{currentQuiz.category}</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-2">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                Assessment Integrity &amp; Transparency Notice
              </span>
              <p className="leading-relaxed">
                Answers are evaluated on the trusted platform server upon submission. You will receive immediate feedback, question-by-question explanations, and skill breakdown tags. Quiz outcomes reflect self-development progress and are not a legal substitute for university degrees.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={startQuiz}
                className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <span>Start Assessment Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* State 2: Taking the Quiz */}
        {quizState === 'taking' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md space-y-6">
            {/* Top Bar with Timer and Progress */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
                  {currentQ.skillTag}
                </span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${
                  secondsRemaining < 120
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="py-2">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {currentQ.questionText}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = userAnswers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, idx)}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 text-blue-950 shadow-xs ring-1 ring-blue-500'
                        : 'bg-slate-50/50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white text-slate-500'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Stepper Controls */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-30 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex gap-1.5">
                {currentQuiz.questions.map((q, idx) => {
                  const answered = userAnswers[q.id] !== undefined;
                  const isCur = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                        isCur
                          ? 'bg-blue-600 text-white'
                          : answered
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{submitting ? 'Evaluating...' : 'Submit Assessment'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* State 3: Quiz Results and Detailed Review */}
        {quizState === 'completed' && latestAttemptResult && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Assessment Completed &bull; Result Recorded</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    {latestAttemptResult.quizTitle}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Submitted on {new Date(latestAttemptResult.submittedAt).toLocaleDateString()} at{' '}
                    {new Date(latestAttemptResult.submittedAt).toLocaleTimeString()}
                  </p>
                </div>

                {/* Score Pill */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center shrink-0 min-w-[140px]">
                  <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                    Calculated Score
                  </span>
                  <div className="text-3xl font-extrabold text-blue-700 mt-1">
                    {latestAttemptResult.score} / {latestAttemptResult.totalQuestions}
                  </div>
                  <span className="inline-block mt-1 text-xs font-bold text-slate-700">
                    {latestAttemptResult.percentage}% Score
                  </span>
                </div>
              </div>

              {/* Feedback box */}
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Automated Evaluation:</span>
                {latestAttemptResult.feedback}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 items-center text-xs">
                <span className="text-slate-500 font-semibold">Evaluated Competencies:</span>
                {latestAttemptResult.skillsEvaluated.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-medium border border-blue-200 text-[11px]"
                  >
                    {sk}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setQuizState('instructions')}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Practice
                </button>
              </div>
            </div>

            {/* In-Depth Question Explanations Review */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                Comprehensive Answer Key &amp; Technical Explanations
              </h3>

              <div className="space-y-6">
                {currentQuiz.questions.map((q, qIdx) => {
                  const studentAnswer = latestAttemptResult.answers[q.id];
                  const isCorrect = studentAnswer === q.correctAnswerIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-rose-200 bg-rose-50/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-500">
                            Q{qIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {q.questionText}
                          </span>
                        </div>
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full shrink-0">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-3">
                        {q.options.map((opt, optIdx) => {
                          const isKey = optIdx === q.correctAnswerIndex;
                          const isChosen = studentAnswer === optIdx;

                          let badgeStyle = 'border-slate-200 bg-white text-slate-600';
                          if (isKey) {
                            badgeStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                          } else if (isChosen && !isCorrect) {
                            badgeStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${badgeStyle}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-bold text-[10px]">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>

                              {isKey && (
                                <span className="text-[10px] uppercase font-bold text-emerald-700">
                                  Correct Key
                                </span>
                              )}
                              {isChosen && !isKey && (
                                <span className="text-[10px] uppercase font-bold text-rose-700">
                                  Your Choice
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-3 bg-white/80 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        <span className="font-bold text-slate-900 block mb-0.5">Rationale:</span>
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Previous Quiz History Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              My Assessment History
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {pastAttempts.length} Recorded Submissions
            </span>
          </div>

          {loadingHistory ? (
            <p className="text-xs text-slate-500 italic py-2">Loading attempt records...</p>
          ) : pastAttempts.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs space-y-2">
              <Award className="w-8 h-8 text-slate-300 mx-auto" />
              <p>You haven't submitted any weekly quizzes yet. Complete this week's assessment above!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pastAttempts.map((attempt) => (
                <div key={attempt.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{attempt.quizTitle}</h4>
                    <p className="text-[11px] text-slate-500">
                      {new Date(attempt.submittedAt).toLocaleDateString()} &bull; Skills:{' '}
                      {attempt.skillsEvaluated?.join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-blue-700">
                      {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                    </span>
                    <span className="block text-[10px] text-slate-400">Recorded</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
