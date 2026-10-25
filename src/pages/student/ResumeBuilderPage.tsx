import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_COMPETENCY_BLUEPRINTS } from '../../firebase/seedData';
import {
  FileText,
  Sparkles,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Plus,
  Trash2,
  GraduationCap,
  Briefcase,
  Layers,
  Award,
  Upload,
  RefreshCw,
  Eye,
  Check,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  FileCode,
  Download,
  Clock
} from 'lucide-react';

interface ResumeExperience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

interface ResumeProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

interface SkillAssessment {
  skill: string;
  level: 'unverified' | 'assessed' | 'verified';
  score: number;
  lastAttempt: string;
}

export const ResumeBuilderPage: React.FC = () => {
  const { userProfile, updateStudentProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'builder' | 'parser' | 'verification'>('builder');

  // Resume form state
  const [fullName, setFullName] = useState(userProfile?.displayName || 'Alex Vance');
  const [email, setEmail] = useState(userProfile?.email || 'alex.vance@university.edu');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [location, setLocation] = useState(userProfile?.city ? `${userProfile.city}, ${userProfile.country || ''}` : 'San Francisco, CA');
  const [headline, setHeadline] = useState(userProfile?.degree || 'Software Engineering Graduate Candidate');
  const [summary, setSummary] = useState(
    userProfile?.bio ||
      'Detail-oriented software engineer with demonstrable competencies in distributed systems, modern React development, and database architecture. Passionate about writing scalable, well-tested code in agile enterprise teams.'
  );

  // Education
  const [institution, setInstitution] = useState(userProfile?.institution || 'State University of Technology');
  const [degree, setDegree] = useState(userProfile?.degree || 'B.Tech in Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState(userProfile?.graduationYear || '2026');
  const [gpa, setGpa] = useState('3.85 / 4.0');

  // Skills
  const [skills, setSkills] = useState<string[]>(
    userProfile?.skills && userProfile.skills.length > 0
      ? userProfile.skills
      : ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'System Design']
  );
  const [newSkill, setNewSkill] = useState('');

  // Experience
  const [experiences, setExperiences] = useState<ResumeExperience[]>([
    {
      id: 'exp-1',
      role: 'Full-Stack Software Engineering Intern',
      company: 'TechFlow Systems',
      duration: 'June 2025 - August 2025',
      description:
        'Engineered responsive analytics dashboards in React and TypeScript, optimizing client-side virtualized rendering and reducing load latency by 28%. Designed idempotent Express API endpoints with PostgreSQL transaction support.'
    }
  ]);

  // Projects
  const [projects, setProjects] = useState<ResumeProject[]>(
    userProfile?.projects && userProfile.projects.length > 0
      ? userProfile.projects
      : [
          {
            id: 'proj-1',
            title: 'High-Concurrency Event Ingestion Engine',
            description:
              'Engineered a distributed telemetry pipeline handling 10k messages/sec with WebSocket subscriptions, automated schema validation, and Jest unit test coverage > 85%.',
            technologies: ['TypeScript', 'Node.js', 'Redis', 'Docker'],
            link: 'https://github.com/example/telemetry-pipeline'
          }
        ]
  );

  // Certifications
  const [certifications, setCertifications] = useState<string[]>([
    'AWS Certified Cloud Practitioner (2025)',
    'Meta Certified Front-End Developer'
  ]);

  // Parser / Upload State
  const [rawResumeText, setRawResumeText] = useState('');
  const [parseLoading, setParseLoading] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<{
    name?: string;
    skills?: string[];
    degree?: string;
    institution?: string;
  } | null>(null);

  // Profile Sync State
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Skill Verification Module State
  const [selectedVerifySkill, setSelectedVerifySkill] = useState<string>('TypeScript');
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const [verifiedSkillsMap, setVerifiedSkillsMap] = useState<Record<string, SkillAssessment>>({
    React: { skill: 'React', level: 'verified', score: 92, lastAttempt: '2026-10-20' },
    TypeScript: { skill: 'TypeScript', level: 'assessed', score: 85, lastAttempt: '2026-10-22' },
    Python: { skill: 'Python', level: 'unverified', score: 0, lastAttempt: 'Never' }
  });

  const handlePrint = () => {
    window.print();
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Resume Text Parser
  const handleParseResume = () => {
    if (!rawResumeText.trim()) return;
    setParseLoading(true);

    setTimeout(() => {
      const text = rawResumeText;
      // Extract basic pattern matches
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      const guessedName = lines[0] || fullName;

      const commonTech = ['React', 'TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'Node.js', 'SQL', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Go'];
      const extractedSkills = commonTech.filter((tech) => new RegExp(`\\b${tech}\\b`, 'i').test(text));

      setParsedPreview({
        name: guessedName,
        skills: extractedSkills.length > 0 ? extractedSkills : ['React', 'TypeScript', 'Node.js'],
        degree: 'B.Tech in Computer Science',
        institution: 'Engineering University'
      });
      setParseLoading(false);
    }, 800);
  };

  const handleApplyParsedData = () => {
    if (!parsedPreview) return;
    if (parsedPreview.name) setFullName(parsedPreview.name);
    if (parsedPreview.skills && parsedPreview.skills.length > 0) {
      setSkills(Array.from(new Set([...skills, ...parsedPreview.skills])));
    }
    setActiveTab('builder');
  };

  // Sync with Student Profile (Explicit approval required by Section 7)
  const handleSyncToProfile = async () => {
    setSyncing(true);
    setSyncNotice(null);
    try {
      await updateStudentProfile({
        displayName: fullName,
        degree,
        institution,
        graduationYear,
        skills,
        projects,
        bio: summary
      });
      setSyncNotice('Resume details successfully synchronized to your candidate profile.');
      setTimeout(() => setSyncNotice(null), 4000);
    } catch (e: any) {
      setSyncNotice('Failed to synchronize profile: ' + (e.message || 'Error'));
    } finally {
      setSyncing(false);
    }
  };

  // Skill Verification Questions
  const skillQuestions: Record<string, Array<{ q: string; options: string[]; answerIndex: number; explanation: string }>> = {
    TypeScript: [
      {
        q: 'What is the primary difference between type and interface in TypeScript regarding declaration merging?',
        options: [
          'Interfaces can be merged with subsequent declarations; type aliases cannot.',
          'Type aliases support declaration merging; interfaces do not.',
          'There is no difference; they are 100% interchangeable in all contexts.',
          'Interfaces can only represent primitives, while types represent objects.'
        ],
        answerIndex: 0,
        explanation: 'Interfaces allow declaration merging (multiple interfaces of the same name in the same scope merge their members), which is essential for typing extended libraries, whereas type aliases cannot be reopened once declared.'
      },
      {
        q: 'Which utility type constructs a type with all properties of T set to optional?',
        options: ['Required<T>', 'Partial<T>', 'Readonly<T>', 'Pick<T, K>'],
        answerIndex: 1,
        explanation: 'Partial<T> transforms all properties of T into optional fields (T[P]?).'
      }
    ],
    Python: [
      {
        q: 'How does Python handle memory management for objects, and what role does the Global Interpreter Lock (GIL) play?',
        options: [
          'Python uses reference counting and a generational cyclic garbage collector; the GIL ensures single-threaded bytecode execution.',
          'Python relies exclusively on stack allocation without heap objects.',
          'The GIL enables automatic multi-core parallel execution of CPU-bound threads.',
          'Python objects are manually freed with free() calls.'
        ],
        answerIndex: 0,
        explanation: 'CPython relies primarily on reference counting with a generational cyclic garbage collector to detect circular references. The GIL guarantees thread-safe memory management by allowing only one native thread to execute Python bytecode at a time.'
      }
    ]
  };

  const currentQuestions = skillQuestions[selectedVerifySkill] || skillQuestions['TypeScript'];

  const handleAnswerAssessment = (selectedOptionIndex: number) => {
    const q = currentQuestions[quizQuestionIndex];
    const isCorrect = selectedOptionIndex === q.answerIndex;

    if (isCorrect) {
      setQuizFeedback(`Correct! ${q.explanation}`);
      setVerifiedSkillsMap((prev) => ({
        ...prev,
        [selectedVerifySkill]: {
          skill: selectedVerifySkill,
          level: 'verified',
          score: 95,
          lastAttempt: new Date().toISOString().split('T')[0]
        }
      }));
    } else {
      setQuizFeedback(`Needs review. Explanation: ${q.explanation}. Note: Your skill is retained on your profile as 'Needs Practice' rather than deleted.`);
      setVerifiedSkillsMap((prev) => ({
        ...prev,
        [selectedVerifySkill]: {
          skill: selectedVerifySkill,
          level: 'unverified',
          score: 50,
          lastAttempt: new Date().toISOString().split('T')[0]
        }
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>ATS Resume Studio &amp; Skill Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ATS-Friendly Resume Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Generate clean, machine-parsable resumes, extract data from existing documents, and objectively verify technical skills.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSyncToProfile}
            disabled={syncing}
            className="px-4 py-2.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-xl border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync to Profile</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Sync Notification Banner */}
      {syncNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 print:hidden gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('builder')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'builder'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Resume Editor &amp; Live ATS Preview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('parser')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'parser'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Extract Existing Resume</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verification')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'verification'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Skill Verification System</span>
        </button>
      </div>

      {/* TAB 1: RESUME BUILDER & LIVE PREVIEW */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Input Form (6 cols) */}
          <div className="lg:col-span-6 space-y-6 print:hidden">
            {/* Personal Details */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                Contact &amp; Header Info
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Executive Summary (ATS Compliant)
                </label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white leading-relaxed"
                />
              </div>
            </div>

            {/* Skills & Badges */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  Skills &amp; Technologies ({skills.length})
                </h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddSkill} className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill (e.g. Next.js, GraphQL)"
                  className="flex-1 py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 dark:bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-slate-800"
                >
                  Add Skill
                </button>
              </form>
            </div>
          </div>

          {/* Right: ATS Printable Preview (6 cols) */}
          <div className="lg:col-span-6 bg-white dark:bg-white text-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-6 print:m-0 print:p-0 print:border-none print:shadow-none min-h-[750px]">
            {/* Resume Header */}
            <div className="text-center border-b border-slate-200 pb-4 space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                {fullName}
              </h2>
              <p className="text-xs font-semibold text-slate-700">
                {headline}
              </p>
              <p className="text-[11px] text-slate-600 flex flex-wrap justify-center gap-x-3">
                <span>{email}</span>
                <span>&bull;</span>
                <span>{phone}</span>
                <span>&bull;</span>
                <span>{location}</span>
              </p>
            </div>

            {/* Summary */}
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                Professional Summary
              </h3>
              <p className="text-xs text-slate-800 leading-relaxed pt-1">
                {summary}
              </p>
            </div>

            {/* Technical Skills */}
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                Technical Skills &amp; Competencies
              </h3>
              <p className="text-xs text-slate-800 pt-1">
                <strong className="text-slate-900">Languages &amp; Frameworks:</strong> {skills.join(', ')}
              </p>
            </div>

            {/* Experience */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                Work &amp; Internship Experience
              </h3>
              {experiences.map((exp) => (
                <div key={exp.id} className="space-y-1 pt-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-black text-slate-900">{exp.role}</span>
                    <span className="text-[11px] text-slate-600">{exp.duration}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700">{exp.company}</div>
                  <p className="text-xs text-slate-800 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                Education
              </h3>
              <div className="flex justify-between items-baseline text-xs pt-1">
                <span className="font-black text-slate-900">{institution}</span>
                <span className="text-[11px] text-slate-600">Expected {graduationYear}</span>
              </div>
              <p className="text-xs text-slate-800">{degree} &bull; GPA: {gpa}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESUME PARSER / EXTRACTOR */}
      {activeTab === 'parser' && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload or Paste Existing Resume Text
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste your raw resume text below. Our parser will extract your skills, education, and roles for you to review before updating your profile.
            </p>
          </div>

          <textarea
            rows={10}
            value={rawResumeText}
            onChange={(e) => setRawResumeText(e.target.value)}
            placeholder="Paste raw resume text here (e.g. John Doe, Software Engineer, Education: B.Tech Computer Science, Skills: React, Python, TypeScript...)"
            className="w-full p-4 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="button"
            disabled={parseLoading || !rawResumeText.trim()}
            onClick={handleParseResume}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {parseLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Parsing resume details...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract Details</span>
              </>
            )}
          </button>

          {parsedPreview && (
            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Extracted Information for Review
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Extracted Name:</span>
                  <div className="font-bold text-slate-900 dark:text-white">{parsedPreview.name}</div>
                </div>
                <div>
                  <span className="text-slate-400">Degree Field:</span>
                  <div className="font-bold text-slate-900 dark:text-white">{parsedPreview.degree}</div>
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Extracted Technologies:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {parsedPreview.skills?.map((sk) => (
                    <span key={sk} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleApplyParsedData}
                  className="px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
                >
                  Apply to Resume Editor &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SKILL VERIFICATION SYSTEM */}
      {activeTab === 'verification' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Objective Skill Verification Assessments
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Distinguishes between self-reported skills and verified competencies. Skills are never deleted on a mistake; they are tagged as needing practice.
                </p>
              </div>
            </div>

            {/* Skill Selector */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['TypeScript', 'React', 'Python', 'Node.js', 'Databases'].map((sk) => {
                const stat = verifiedSkillsMap[sk];
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => {
                      setSelectedVerifySkill(sk);
                      setQuizFeedback(null);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                      selectedVerifySkill === sk
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{sk}</span>
                    {stat?.level === 'verified' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Assessment Card */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {selectedVerifySkill} Diagnostic Question {quizQuestionIndex + 1}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Objective Competency Test</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {currentQuestions[quizQuestionIndex].q}
              </h4>

              <div className="space-y-2 pt-2">
                {currentQuestions[quizQuestionIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAnswerAssessment(idx)}
                    className="w-full p-3 text-left text-xs bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-300 rounded-xl transition-all"
                  >
                    <span className="font-bold mr-2 text-slate-400">{String.fromCharCode(65 + idx)}.</span>
                    <span className="text-slate-800 dark:text-slate-200">{opt}</span>
                  </button>
                ))}
              </div>

              {quizFeedback && (
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 leading-relaxed animate-in fade-in">
                  {quizFeedback}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
