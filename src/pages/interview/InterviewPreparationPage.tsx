import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Video,
  Code2,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  Clock,
  Play,
  FileCode,
  Layers,
  MessageSquare,
  Check
} from 'lucide-react';

interface QuestionItem {
  id: string;
  topic: string;
  level: number;
  type: 'code' | 'concept' | 'behavioral' | 'system_design';
  title: string;
  prompt: string;
  codeSnippet?: string;
  hints: string[];
  expectedPoints: string[];
  sampleModelAnswer: string;
  interviewTip: string;
  followUp: string;
}

const INTERVIEW_QUESTIONS: QuestionItem[] = [
  // Level 1: Fundamentals
  {
    id: 'q-react-1',
    topic: 'React',
    level: 1,
    type: 'concept',
    title: 'React Reconciliation & Virtual DOM',
    prompt: 'How does React determine when to re-render the DOM, and what role do keys play in list reconciliation?',
    hints: ['Mention diffing algorithm', 'Explain stable identity of list elements'],
    expectedPoints: [
      'Virtual DOM comparison against previous render tree',
      'Heuristic O(n) diffing algorithm',
      'Keys provide stable identity across renders to prevent unnecessary re-mounts'
    ],
    sampleModelAnswer: 'React maintains a Virtual DOM representation. When state or props change, React generates a new virtual tree and runs its reconciliation (diffing) algorithm against the previous tree. By default, React assumes distinct component types produce different trees. In lists, keys give React a stable identifier across render cycles, allowing it to insert, reorder, or delete only modified elements rather than re-mounting entire arrays of DOM nodes.',
    interviewTip: 'Structure your answer in 3 parts: (1) Concept definition, (2) The problem it solves (render efficiency), and (3) Practical best practice (never using Math.random() as key).',
    followUp: 'What happens when you use an array index as a key for a list that can be sorted or filtered?'
  },
  {
    id: 'q-js-1',
    topic: 'JavaScript',
    level: 1,
    type: 'concept',
    title: 'Event Loop & Microtask Queue',
    prompt: 'Explain the order of execution between Synchronous code, Promises (microtasks), and setTimeout (macrotasks) in Node.js/browsers.',
    hints: ['Call stack empties first', 'Microtask queue drains before next macrotask'],
    expectedPoints: [
      'Call stack executes synchronous code first',
      'Microtasks (Promise.then, queueMicrotask) run immediately after call stack empties',
      'Macrotasks (setTimeout, setInterval) execute in the next tick of the event loop'
    ],
    sampleModelAnswer: 'JavaScript is single-threaded. Execution begins with synchronous code on the Call Stack. When an asynchronous operation resolves, its callback is scheduled into one of two queues: Microtasks (Promises, MutationObserver, queueMicrotask) or Macrotasks (setTimeout, I/O). Once the Call Stack is empty, the Event Loop processes ALL available microtasks before picking the next macrotask from the task queue.',
    interviewTip: 'Diagram or write a quick 4-line snippet demonstrating: console.log(1); setTimeout(...); Promise.resolve().then(...); console.log(2).',
    followUp: 'How does process.nextTick() differ from Promise microtasks in Node.js?'
  },
  {
    id: 'q-dsa-1',
    topic: 'Data Structures & Algorithms',
    level: 1,
    type: 'code',
    title: 'Two Sum Problem (Optimal O(N) Hash Map)',
    prompt: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target. Write an optimal O(n) solution in TypeScript or JavaScript.',
    codeSnippet: `function twoSum(nums: number[], target: number): number[] {\n  // Write your O(n) hash map solution here\n}`,
    hints: ['Use Map or Record to store complement', 'One-pass traversal'],
    expectedPoints: [
      'Store complement (target - num) in hash table',
      'Single pass O(n) time complexity',
      'O(n) auxiliary space complexity'
    ],
    sampleModelAnswer: `function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement)!, i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
    interviewTip: 'State Big-O time and space complexity upfront before typing code. Explicitly mention edge cases: duplicates and empty input.',
    followUp: 'If the array is guaranteed to be sorted, how can you solve it in O(1) extra space?'
  },

  // Level 2: Intermediate Concepts
  {
    id: 'q-node-1',
    topic: 'Node.js',
    level: 2,
    type: 'concept',
    title: 'Cluster Mode vs Worker Threads',
    prompt: 'When should an enterprise Node.js service use Worker Threads versus Cluster Mode (multi-process)?',
    hints: ['Cluster creates isolated OS processes', 'Worker threads share memory via ArrayBuffer'],
    expectedPoints: [
      'Cluster mode forks separate processes to utilize multi-core CPUs for I/O requests',
      'Worker threads run in the same process and share memory for CPU-intensive tasks',
      'Zero-downtime rolling updates in cluster'
    ],
    sampleModelAnswer: 'Cluster mode forks independent Node.js processes each with their own memory space and V8 instance, listening on the same server port. This is optimal for scaling standard web API throughput across CPU cores. Worker threads run inside a single process, sharing address space. They are designed for CPU-bound tasks (cryptographic processing, image manipulation, large JSON parsing) to avoid blocking the main event loop.',
    interviewTip: 'Anchor your answer in production trade-offs: memory footprint (Cluster uses ~30MB per process) vs race conditions (threads sharing memory).',
    followUp: 'How do you handle graceful shutdown in a clustered Node.js application?'
  },
  {
    id: 'q-db-1',
    topic: 'Databases & SQL',
    level: 2,
    type: 'concept',
    title: 'Index Optimization & Composite Indexes',
    prompt: 'Explain the "Leftmost Prefix" rule for composite B-Tree indexes and how it affects query performance in relational databases.',
    hints: ['Index order matters: (colA, colB)', 'Leading column must be in WHERE clause'],
    expectedPoints: [
      'B-Tree composite indexes are sorted in the exact column sequence specified',
      'Queries filtering on (colA) or (colA, colB) utilize index; queries only on (colB) skip index',
      'Index selectivity and cardinality guide column ordering'
    ],
    sampleModelAnswer: 'In a composite index on (A, B, C), the database engine sorts data first by A, then by B within identical values of A, and then by C. The leftmost prefix rule states that an index scan can only be used if the query conditions include the leading column (A). A query filtering WHERE A = 5 AND B = 10 utilizes the index efficiently, whereas a query filtering only WHERE B = 10 cannot utilize the B-Tree index scan and will trigger a full table scan.',
    interviewTip: 'Mention EXPLAIN ANALYZE as the definitive tool used in enterprise code reviews to inspect index scan behavior.',
    followUp: 'How does an index-only scan (covering index) improve I/O throughput?'
  },

  // Level 3: Advanced Concepts
  {
    id: 'q-sys-1',
    topic: 'System Design',
    level: 3,
    type: 'system_design',
    title: 'Designing an Idempotent Payment API',
    prompt: 'How would you design an API endpoint POST /api/payments that guarantees payment is processed exactly once even when the client retries over an unstable mobile network?',
    hints: ['Idempotency key in headers', 'Distributed locking or unique database constraint'],
    expectedPoints: [
      'Client generates unique Idempotency-Key UUID header',
      'Atomic insert into Idempotency/Transaction table with UNIQUE key',
      'Redis distributed lock or DB transaction preventing duplicate concurrent executions',
      'Cached previous response returned if identical key retried'
    ],
    sampleModelAnswer: 'The client includes an `Idempotency-Key: <uuid>` header with the payment request. When the server receives the request, it executes an atomic operation: checking a fast key-value store (or relational unique constraint table) for that key. If key exists with status "COMPLETED", it returns the stored result immediately without charging again. If status is "IN_PROGRESS", it returns HTTP 409 Conflict. If not found, it inserts the key in "PROCESSING" state, processes the gateway charge, updates the database, records the response payload, and returns HTTP 200.',
    interviewTip: 'Mention TTL (time-to-live) for idempotency records (typically 24–72 hours) and payload hashing to detect mutated request bodies.',
    followUp: 'How do you handle a scenario where the payment gateway confirms charge but your DB fails to save the receipt?'
  },

  // Level 4: Behavioral & Engineering Culture
  {
    id: 'q-beh-1',
    topic: 'Behavioral & Leadership',
    level: 4,
    type: 'behavioral',
    title: 'Handling Technical Disagreement on Architecture',
    prompt: 'Tell me about a time you had a strong technical disagreement with a team member or lead regarding an architecture or implementation decision. How did you resolve it?',
    hints: ['Use STAR framework (Situation, Task, Action, Result)', 'Focus on data and benchmarks rather than ego'],
    expectedPoints: [
      'Clear description of technical trade-offs (e.g. REST vs GraphQL, SQL vs NoSQL)',
      'Objective benchmarking or proof of concept (PoC)',
      'Commitment to team alignment once a decision was made (Disagree and Commit)'
    ],
    sampleModelAnswer: 'During our capstone engineering project, my teammate advocated for a schemaless NoSQL store for simplicity, whereas our requirements involved highly relational student grade transcripts and foreign-key integrity. Instead of debating abstractly, I created a quick benchmark script modeling our core query patterns (transcripts with join queries vs duplicated documents). The benchmark demonstrated that SQL reduced storage duplication by 60% and prevented orphan records. We reviewed the numbers collaboratively, agreed on PostgreSQL, and shipped on schedule.',
    interviewTip: 'Avoid casting the other person negatively. Emphasize mutual respect, objective prototyping, and prioritizing project goals.',
    followUp: 'What would you have done if the team lead still chose NoSQL despite your benchmark?'
  }
];

export const InterviewPreparationPage: React.FC = () => {
  const { userProfile, currentUser } = useAuth();

  const [selectedTopic, setSelectedTopic] = useState<string>('All Topics');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // User Answer state
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    feedback: string;
    strengths: string[];
    missingAspects: string[];
    suggestedModelAnswer: string;
    interviewTip: string;
    followUp: string;
  } | null>(null);

  const [history, setHistory] = useState<Array<{ qId: string; score: number; timestamp: string }>>(() => {
    try {
      const saved = localStorage.getItem('careerpulse_interview_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const topics = ['All Topics', 'React', 'JavaScript', 'Node.js', 'Databases & SQL', 'Data Structures & Algorithms', 'System Design', 'Behavioral & Leadership'];

  const filteredQuestions = INTERVIEW_QUESTIONS.filter((q) => {
    const topicMatch = selectedTopic === 'All Topics' || q.topic === selectedTopic;
    const levelMatch = q.level === selectedLevel;
    return topicMatch && levelMatch;
  });

  const activeQuestion: QuestionItem | undefined = filteredQuestions[currentQuestionIndex] || INTERVIEW_QUESTIONS[0];

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setEvaluationResult(null);
  }, [selectedTopic, selectedLevel]);

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) return;
    setEvaluating(true);

    try {
      // Simulate realistic AI assessment rubric evaluation
      const answerLower = userAnswer.toLowerCase();
      let matchedPoints = 0;
      const strengths: string[] = [];
      const missingAspects: string[] = [];

      activeQuestion.expectedPoints.forEach((pt) => {
        const keywords = pt.toLowerCase().split(' ').filter((w) => w.length > 4);
        const match = keywords.some((kw) => answerLower.includes(kw));
        if (match) {
          matchedPoints++;
          strengths.push(pt);
        } else {
          missingAspects.push(pt);
        }
      });

      const lengthBonus = Math.min(20, Math.floor(userAnswer.trim().split(/\s+/).length / 3));
      const calculatedScore = Math.min(
        98,
        Math.max(45, Math.round((matchedPoints / activeQuestion.expectedPoints.length) * 75) + lengthBonus)
      );

      const result = {
        score: calculatedScore,
        feedback:
          calculatedScore >= 80
            ? 'Strong, structured answer demonstrating clear understanding of underlying mechanics and production considerations.'
            : calculatedScore >= 60
            ? 'Solid conceptual foundation. To achieve top rubric marks, address edge cases and explicitly state the engineering trade-offs.'
            : 'Good initial start. Strengthen your answer by incorporating the specific terminology and technical indicators highlighted below.',
        strengths: strengths.length > 0 ? strengths : ['Communicated initial reasoning clearly.'],
        missingAspects: missingAspects.length > 0 ? missingAspects : ['Consider quantifying impact or adding benchmark trade-offs.'],
        suggestedModelAnswer: activeQuestion.sampleModelAnswer,
        interviewTip: activeQuestion.interviewTip,
        followUp: activeQuestion.followUp
      };

      setEvaluationResult(result);

      // Save to local history
      const newEntry = { qId: activeQuestion.id, score: calculatedScore, timestamp: new Date().toISOString() };
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('careerpulse_interview_history', JSON.stringify(updatedHistory));
    } finally {
      setEvaluating(false);
    }
  };

  const completedCount = history.length;
  const averageScore = history.length > 0
    ? Math.round(history.reduce((acc, h) => acc + h.score, 0) / history.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
            <Video className="w-3.5 h-3.5" />
            <span>AI Interview Preparation &amp; Rubric Trainer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Master Technical &amp; Behavioral Interviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Practice progressively calibrated questions across 5 difficulty levels. Get instant rubric feedback, model answers, and follow-up challenges.
          </p>
        </div>

        {/* Live Practice Room CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Link
            to="/interview/room-mock-live"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span>Enter Live Video Room</span>
          </Link>
        </div>
      </div>

      {/* Progress & Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Questions Practiced</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{completedCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Average Rubric Score</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{averageScore > 0 ? `${averageScore}%` : 'N/A'}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Target Role Match</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {userProfile?.targetRole || 'Software Engineer'}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Current Mastery</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            Level {selectedLevel} of 5
          </div>
        </div>
      </div>

      {/* Filter Row: Level Switcher & Topic Selector */}
      <div className="space-y-4">
        {/* Levels */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const levelTitles = ['Fundamentals', 'Intermediate', 'Advanced', 'Scenario / Role', 'Full Mock Assessment'];
            const isSelected = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Level {lvl}:</span>
                <span className="font-normal opacity-90">{levelTitles[lvl - 1]}</span>
              </button>
            );
          })}
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-1.5">
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedTopic(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedTopic === t
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN QUESTION WORKSPACE */}
      {activeQuestion ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Question & Answer Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                  {activeQuestion.topic} &bull; Level {activeQuestion.level}
                </span>
                <span className="text-xs text-slate-400">
                  Question {currentQuestionIndex + 1} of {filteredQuestions.length || 1}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {activeQuestion.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {activeQuestion.prompt}
              </p>

              {/* Hints */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-blue-600" />
                  Key Evaluation Hints:
                </div>
                <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px]">
                  {activeQuestion.hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>

              {/* Text / Code input */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Your Answer &bull; Code or Explanation
                </label>
                <textarea
                  rows={8}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={
                    activeQuestion.type === 'code'
                      ? 'Write your typed code solution and algorithmic explanation here...'
                      : 'Provide a structured, technical response citing concepts, trade-offs, and examples...'
                  }
                  className="w-full p-4 font-mono text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUserAnswer('');
                    setEvaluationResult(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  Clear Answer
                </button>

                <button
                  type="button"
                  disabled={evaluating || !userAnswer.trim()}
                  onClick={handleEvaluate}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {evaluating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Evaluating Rubric...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Submit &amp; Evaluate Answer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Feedback & Model Answer Column */}
          <div className="lg:col-span-5 space-y-6">
            {evaluationResult ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
                {/* Score Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-400">Rubric Score</span>
                    <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                      <span>{evaluationResult.score}</span>
                      <span className="text-sm font-semibold text-slate-400">/ 100</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      evaluationResult.score >= 80
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : evaluationResult.score >= 65
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {evaluationResult.score >= 80 ? 'Proficient' : evaluationResult.score >= 65 ? 'Capable' : 'Needs Practice'}
                  </span>
                </div>

                {/* Overall Feedback */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Evaluation Analysis</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {evaluationResult.feedback}
                  </p>
                </div>

                {/* Strengths & Missing Indicators */}
                <div className="space-y-3">
                  <div>
                    <h5 className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                      <Check className="w-3.5 h-3.5" /> Demonstrated Competencies
                    </h5>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pl-4 list-disc">
                      {evaluationResult.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Missing or Incomplete Aspects
                    </h5>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pl-4 list-disc">
                      {evaluationResult.missingAspects.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Stronger Example Answer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Model Enterprise Answer
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                    {evaluationResult.suggestedModelAnswer}
                  </p>
                </div>

                {/* Interview Tip */}
                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900 text-xs text-blue-950 dark:text-blue-200 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    How to Communicate in a Real Interview:
                  </span>
                  <p className="text-[11px] leading-relaxed opacity-90">{evaluationResult.interviewTip}</p>
                </div>

                {/* Follow-up question */}
                <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-100 dark:border-purple-900 text-xs text-purple-950 dark:text-purple-200 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    Recommended Follow-Up Challenge:
                  </span>
                  <p className="text-[11px] leading-relaxed opacity-90">{evaluationResult.followUp}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Ready for Feedback?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Type your technical response in the workspace and click "Submit &amp; Evaluate Answer" to generate a detailed rubric review.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <p className="text-xs text-slate-500">No questions found for the selected filter combination.</p>
        </div>
      )}
    </div>
  );
};
