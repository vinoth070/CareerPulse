import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_COMPETENCY_BLUEPRINTS } from '../../firebase/seedData';
import {
  FileText,
  Sparkles,
  Download,
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
  ExternalLink
} from 'lucide-react';

export const ResumeBuilderPage: React.FC = () => {
  const { userProfile, updateStudentProfile } = useAuth();

  // Resume form state
  const [fullName, setFullName] = useState(userProfile?.displayName || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [headline, setHeadline] = useState(userProfile?.degree || 'Software Engineering Candidate');
  const [summary, setSummary] = useState(userProfile?.bio || '');
  const [institution, setInstitution] = useState(userProfile?.institution || '');
  const [degree, setDegree] = useState(userProfile?.degree || '');
  const [graduationYear, setGraduationYear] = useState(userProfile?.graduationYear || '2026');

  const [skills, setSkills] = useState<string[]>(userProfile?.skills || ['React', 'TypeScript', 'Node.js', 'SQL']);
  const [newSkill, setNewSkill] = useState('');

  // Experience items
  const [experiences, setExperiences] = useState([
    {
      id: 'exp-1',
      role: 'Full-Stack Engineering Intern',
      company: 'TechFlow Systems',
      duration: 'June 2025 - August 2025',
      description: 'Engineered high-throughput client dashboard components in React and optimized REST endpoint serialization, improving load times by 24%.'
    }
  ]);
  const [showAddExp, setShowAddExp] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');

  // Projects
  const [projects, setProjects] = useState(
    userProfile?.projects || [
      {
        id: 'p1',
        title: 'Distributed Analytics Pipeline',
        description: 'Constructed an event ingestion pipeline using WebSockets and TypeScript with sub-200ms latency.',
        technologies: ['React', 'TypeScript', 'Tailwind CSS']
      }
    ]
  );

  // Resume Improvement Engine
  const [targetRoleKey, setTargetRoleKey] = useState('frontend-developer');
  const [analysisDone, setAnalysisDone] = useState(true);

  const targetBlueprint = ROLE_COMPETENCY_BLUEPRINTS[targetRoleKey];

  // Improvement analysis checks
  const resumeText = `${headline} ${summary} ${skills.join(' ')} ${projects.map((p) => p.description + ' ' + p.technologies.join(' ')).join(' ')} ${experiences.map((e) => e.description).join(' ')}`.toLowerCase();

  const missingRoleSkills = targetBlueprint.requiredSkills.filter(
    (sk) => !resumeText.includes(sk.toLowerCase().split(' ')[0])
  );

  const hasMetricsInExperience = experiences.some((e) => /\d+%|\d+x|\d+ms|\d+k/i.test(e.description));
  const hasStrongSummary = summary.length >= 60;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.trim() || !newCompany.trim()) return;

    setExperiences([
      ...experiences,
      {
        id: `exp-${Date.now()}`,
        role: newRole.trim(),
        company: newCompany.trim(),
        duration: newDuration.trim() || '2025 - Present',
        description: newExpDesc.trim()
      }
    ]);

    setNewRole('');
    setNewCompany('');
    setNewDuration('');
    setNewExpDesc('');
    setShowAddExp(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200">
              <FileText className="w-3.5 h-3.5" />
              <span>Professional Resume Builder &amp; Optimizer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Evidence-Based Resume Studio
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Format your credentials into clean, professional layouts. Compare your content directly against target role specifications and eliminate generic fluff.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Two-Column Workspace: Form & Suggestions Left, Live Preview Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Rule-Based Improvement Analysis (7 cols) */}
          <div className="lg:col-span-6 space-y-6 print:hidden">
            {/* Target Role Selector for Improvement Suggestions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Target Role Alignment &amp; Suggestions
                </h3>
                <span className="text-[10px] font-bold uppercase text-slate-400">Rule-Based</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium">Evaluate against:</span>
                <select
                  value={targetRoleKey}
                  onChange={(e) => setTargetRoleKey(e.target.value)}
                  className="py-1.5 px-3 text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="frontend-developer">Frontend Software Engineer</option>
                  <option value="backend-developer">Backend &amp; Cloud API Engineer</option>
                  <option value="cloud-devops">Cloud &amp; DevOps Engineer</option>
                  <option value="data-analyst">Data Analyst Specialist</option>
                </select>
              </div>

              {/* Suggestions Cards */}
              <div className="space-y-2 pt-2">
                {missingRoleSkills.length > 0 ? (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-amber-950">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Missing Role Competencies
                    </span>
                    <p className="leading-relaxed">
                      The target role frequently requires: <strong>{missingRoleSkills.slice(0, 4).join(', ')}</strong>. If you have coursework or projects involving these, add them to your skills or project descriptions.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All primary competencies for {targetBlueprint.roleName} are reflected!</span>
                  </div>
                )}

                {!hasMetricsInExperience && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-blue-600" /> Measurable Impact Recommendation
                    </span>
                    <p className="leading-relaxed">
                      Recruiters prefer bullet points with measurable outcomes (e.g. "improved query speed by 25%", "reduced bundle size by 40kB"). Add quantifiable metrics where you have evidence.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Resume Content Edit Accordions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Edit Resume Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Associate Software Engineer & Full-Stack Developer"
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Summary</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Concise summary of your background, technical specialties, and engineering values..."
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">University / College</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Degree &amp; Graduation</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Skills Editor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skills Tagging</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add skill (e.g. Docker, GraphQL)"
                    className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                  <button
                    onClick={handleAddSkill}
                    type="button"
                    className="px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs flex items-center gap-1 border border-slate-200"
                    >
                      <span>{sk}</span>
                      <button
                        onClick={() => setSkills(skills.filter((s) => s !== sk))}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Experience &amp; Internships</span>
                  <button
                    onClick={() => setShowAddExp(!showAddExp)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    + Add Experience
                  </button>
                </div>

                {showAddExp && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="Role / Title"
                        className="py-1.5 px-2 bg-white border border-slate-300 rounded-md"
                      />
                      <input
                        type="text"
                        value={newCompany}
                        onChange={(e) => setNewCompany(e.target.value)}
                        placeholder="Organization / Company"
                        className="py-1.5 px-2 bg-white border border-slate-300 rounded-md"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={newExpDesc}
                      onChange={(e) => setNewExpDesc(e.target.value)}
                      placeholder="Bullet point accomplishments with measurable impact..."
                      className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-md"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowAddExp(false)}
                        className="px-2.5 py-1 text-slate-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddExperience}
                        className="px-3 py-1 bg-blue-600 text-white font-bold rounded-md"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex justify-between gap-2"
                    >
                      <div className="text-xs space-y-0.5">
                        <p className="font-bold text-slate-900">{exp.role} &bull; {exp.company}</p>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{exp.description}</p>
                      </div>
                      <button
                        onClick={() => setExperiences(experiences.filter((e) => e.id !== exp.id))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Enterprise-Grade Resume Preview (6 cols) */}
          <div className="lg:col-span-6 sticky top-24 bg-white p-8 sm:p-10 rounded-2xl border border-slate-300 shadow-md print:shadow-none print:border-none print:p-0 space-y-6 font-sans">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">
                {fullName || 'Your Name'}
              </h1>
              <p className="text-xs font-semibold text-blue-700 tracking-wider uppercase mt-0.5">
                {headline}
              </p>
              <div className="flex flex-wrap gap-4 text-[11px] text-slate-600 mt-2">
                <span>Email: {email}</span>
                <span>&bull;</span>
                <span>Institution: {institution}</span>
                <span>&bull;</span>
                <span>Graduation: {graduationYear}</span>
              </div>
            </div>

            {/* Summary */}
            {summary && (
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Professional Profile
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed pt-1">
                  {summary}
                </p>
              </div>
            )}

            {/* Education */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                Education
              </h3>
              <div className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-900">{degree || 'Degree Program'}</span>
                  <span className="text-slate-600 block text-[11px]">{institution}</span>
                </div>
                <span className="text-slate-500 font-medium text-[11px]">Class of {graduationYear}</span>
              </div>
            </div>

            {/* Experience */}
            {experiences.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Experience &amp; Internships
                </h3>
                {experiences.map((exp) => (
                  <div key={exp.id} className="text-xs space-y-0.5">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900">{exp.role}</span>
                      <span className="text-slate-500 text-[11px]">{exp.duration}</span>
                    </div>
                    <span className="text-blue-800 font-semibold block text-[11px]">{exp.company}</span>
                    <p className="text-slate-700 leading-relaxed pt-0.5 text-[11px]">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Featured Projects
                </h3>
                {projects.map((proj) => (
                  <div key={proj.id} className="text-xs space-y-0.5">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900">{proj.title}</span>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {proj.description}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Tech Stack: {proj.technologies?.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                Technical Competencies
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {skills.join('  •  ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
