import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, ProjectItem, CertificationItem, DigitalBadge } from '../../types';
import { INITIAL_DEMO_BADGES } from '../../firebase/seedData';
import { BadgeCard } from '../../components/common/BadgeCard';
import {
  User,
  GraduationCap,
  Briefcase,
  Award,
  Layers,
  Sparkles,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Link as LinkIcon,
  FileText,
  ShieldCheck,
  Trophy
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { userProfile, updateStudentProfile } = useAuth();

  // Local state initialized with userProfile
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [headline, setHeadline] = useState(userProfile?.headline || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [educationLevel, setEducationLevel] = useState(userProfile?.educationLevel || 'Undergraduate');

  const [degree, setDegree] = useState(userProfile?.degree || '');
  const [institution, setInstitution] = useState(userProfile?.institution || '');
  const [graduationYear, setGraduationYear] = useState(userProfile?.graduationYear || '2026');
  const [careerGoals, setCareerGoals] = useState(userProfile?.careerGoals || '');
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>(
    userProfile?.profileVisibility || 'public'
  );
  const [resumeUrl, setResumeUrl] = useState(userProfile?.resumeUrl || '');

  // Skills
  const [skills, setSkills] = useState<string[]>(
    userProfile?.skills || ['React', 'TypeScript', 'Data Structures']
  );
  const [newSkill, setNewSkill] = useState('');

  const [softSkills, setSoftSkills] = useState<string[]>(
    userProfile?.softSkills || ['Communication', 'Critical Thinking', 'Teamwork']
  );
  const [newSoftSkill, setNewSoftSkill] = useState('');

  // Projects
  const [projects, setProjects] = useState<ProjectItem[]>(
    userProfile?.projects || []
  );
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');
  const [newProjLink, setNewProjLink] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);

  // Certifications
  const [certifications, setCertifications] = useState<CertificationItem[]>(
    userProfile?.certifications || []
  );
  const [newCertTitle, setNewCertTitle] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertYear, setNewCertYear] = useState('2026');
  const [showAddCert, setShowAddCert] = useState(false);

  // Status
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const handleAddSoftSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSoftSkill.trim()) return;
    if (!softSkills.includes(newSoftSkill.trim())) {
      setSoftSkills([...softSkills, newSoftSkill.trim()]);
    }
    setNewSoftSkill('');
  };

  const handleRemoveSoftSkill = (skillToRemove: string) => {
    setSoftSkills(softSkills.filter((s) => s !== skillToRemove));
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;

    const techArray = newProjTech
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: newProjTitle.trim(),
      description: newProjDesc.trim(),
      technologies: techArray,
      link: newProjLink.trim() || undefined
    };

    setProjects([...projects, newProj]);
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjTech('');
    setNewProjLink('');
    setShowAddProject(false);
  };

  const handleRemoveProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const handleCreateCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertTitle.trim() || !newCertIssuer.trim()) return;

    const newCert: CertificationItem = {
      id: `cert-${Date.now()}`,
      title: newCertTitle.trim(),
      issuer: newCertIssuer.trim(),
      year: newCertYear.trim()
    };

    setCertifications([...certifications, newCert]);
    setNewCertTitle('');
    setNewCertIssuer('');
    setShowAddCert(false);
  };

  const handleRemoveCert = (id: string) => {
    setCertifications(certifications.filter((c) => c.id !== id));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateStudentProfile({
        displayName: displayName.trim(),
        headline: headline.trim(),
        bio: bio.trim(),

        educationLevel,
        degree: degree.trim(),
        institution: institution.trim(),
        graduationYear: graduationYear.trim(),
        careerGoals: careerGoals.trim(),
        profileVisibility,
        resumeUrl: resumeUrl.trim(),
        skills,
        softSkills,
        projects,
        certifications,
        profileCompleted: true
      });

      setSuccessMsg('Profile updated and saved securely to Firestore.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save profile. Please check the network.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Professional Profile
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Keep your credentials and portfolio up-to-date for enterprise recruiter discovery.
            </p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        {/* Feedback alerts */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Section 1: Basic Information & Privacy Visibility */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              General Information &amp; Recruiter Discovery
            </h3>

            {/* Privacy Discovery Toggle */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  {profileVisibility === 'public' ? (
                    <Eye className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  )}
                  Recruiter Discovery Visibility
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-lg leading-normal">
                  {profileVisibility === 'public'
                    ? 'Your verified profile is discoverable in candidate search by authorized enterprise recruiters.'
                    : 'Your profile is completely private and hidden from company talent searches.'}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setProfileVisibility('public')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    profileVisibility === 'public'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setProfileVisibility('private')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    profileVisibility === 'private'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Private
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="block w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Identity Protected)
                </label>
                <input
                  type="email"
                  disabled
                  value={userProfile?.email || ''}
                  className="block w-full py-2.5 px-3.5 text-sm bg-slate-100 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1">Managed via Firebase Auth session</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Professional Headline (e.g. "Full-Stack Engineer | Open-Source Contributor")
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Software Engineering Student | Cloud & Distributed Systems Enthusiast"
                className="block w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Professional Bio / Introduction
              </label>

              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your background, core technical focus, and what drives you..."
                className="block w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Career Goals &amp; Ideal Role
              </label>
              <input
                type="text"
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                placeholder="e.g. Seeking graduate Full-Stack or Cloud Systems roles with mentorship"
                className="block w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Portfolio or Public Resume URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://github.com/yourhandle or portfolio link"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Education & Academic Credentials */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              Academic Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Education Level
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="block w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Undergraduate">Undergraduate (B.Tech / B.S. / B.E.)</option>
                  <option value="Postgraduate">Postgraduate (M.S. / M.Tech / M.C.A.)</option>
                  <option value="Doctorate">Doctorate / Ph.D.</option>
                  <option value="Diploma / Associate">Diploma or Associate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Graduation Year
                </label>
                <input
                  type="text"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  placeholder="2026"
                  className="block w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Degree &amp; Specialization
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. B.Tech in Computer Science and Engineering"
                  className="block w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College / University
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. State Institute of Technology"
                  className="block w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Technical & Soft Skills */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Skills &amp; Competencies
            </h3>

            {/* Technical skills */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Technical Skills (Press Enter or Add)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. Python, Docker, GraphQL"
                  className="block w-full py-2 px-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs font-medium"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-blue-400 hover:text-blue-700"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Soft skills */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Soft Skills
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSoftSkill}
                  onChange={(e) => setNewSoftSkill(e.target.value)}
                  placeholder="e.g. Leadership, Problem Solving"
                  className="block w-full py-2 px-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSoftSkill(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSoftSkill}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {softSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSoftSkill(sk)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Projects */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Featured Projects
              </h3>
              <button
                type="button"
                onClick={() => setShowAddProject(!showAddProject)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>

            {/* Add Project Form Drawer */}
            {showAddProject && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Add New Project</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    placeholder="Project Title"
                    className="py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={newProjTech}
                    onChange={(e) => setNewProjTech(e.target.value)}
                    placeholder="Technologies (comma separated, e.g. React, Node.js)"
                    className="py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <textarea
                  rows={2}
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Brief description of the challenge solved and architecture..."
                  className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="url"
                  value={newProjLink}
                  onChange={(e) => setNewProjLink(e.target.value)}
                  placeholder="Project Link or GitHub URL (Optional)"
                  className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddProject(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateProject}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Save Project
                  </button>
                </div>
              </div>
            )}

            {projects.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                No projects listed yet. Click "Add Project" to highlight your work.
              </p>
            ) : (
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{proj.title}</h4>
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <LinkIcon className="w-3 h-3" /> Live
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.technologies.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-medium rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveProject(proj.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Certifications */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                Certifications
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCert(!showAddCert)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Certification
              </button>
            </div>

            {showAddCert && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Add Certification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newCertTitle}
                    onChange={(e) => setNewCertTitle(e.target.value)}
                    placeholder="Certificate Title (e.g. AWS Certified Cloud Practitioner)"
                    className="py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg sm:col-span-2"
                  />
                  <input
                    type="text"
                    value={newCertIssuer}
                    onChange={(e) => setNewCertIssuer(e.target.value)}
                    placeholder="Issuer (e.g. Amazon Web Services)"
                    className="py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddCert(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCert}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Save Certificate
                  </button>
                </div>
              </div>
            )}

            {certifications.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                No external certifications added yet.
              </p>
            ) : (
              <div className="space-y-2">
                {certifications.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{c.title}</p>
                      <p className="text-[11px] text-slate-500">{c.issuer} &bull; {c.year}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCert(c.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Verified Digital Badges & Micro-Credentials */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Verified Digital Badges &amp; Credentials
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cryptographically verifiable badges awarded for scoring 90%+ in weekly assessments, validated industry certifications, and high performance in company challenges.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Recruiter Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {(userProfile?.badges && userProfile.badges.length > 0
                ? userProfile.badges
                : INITIAL_DEMO_BADGES
              ).map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Want to earn more badges? Take this week's assessments or submit a solution to an active Company Innovation Challenge.
              </span>
              <a
                href="/student/assessments"
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline shrink-0"
              >
                View Assessments &rarr;
              </a>
            </div>
          </div>

          {/* Submit bar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Profile...' : 'Save Complete Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
