import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BRAND_CONFIG } from '../../config/brand';
import { PasswordStrengthMeter, getPasswordStrength } from '../../components/common/PasswordStrengthMeter';
import {
  GraduationCap,
  Building2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Globe,
  MapPin,
  ShieldAlert,
  Phone,
  FileCheck,
  CheckSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Info
} from 'lucide-react';

const COMMON_SKILLS = [
  'React',
  'TypeScript',
  'JavaScript',
  'Python',
  'Java',
  'C++',
  'SQL',
  'Node.js',
  'AWS',
  'Docker',
  'Go',
  'Tailwind CSS'
];

const CAREER_INTEREST_OPTIONS = [
  'Full-Stack Development',
  'Frontend Engineering',
  'Backend & Distributed Systems',
  'AI & Machine Learning',
  'Cloud & DevOps',
  'Cybersecurity',
  'Data Science & Analytics',
  'Product Design'
];

export const RegisterPage: React.FC = () => {
  const { registerStudent, registerCompany, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Role Tab
  const initialRole = searchParams.get('role') === 'company' ? 'company' : 'student';
  const [roleTab, setRoleTab] = useState<'student' | 'company'>(initialRole);

  // Student Form State (Phase 3)
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentConfirmPassword, setStudentConfirmPassword] = useState('');
  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React', 'TypeScript', 'Python']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Full-Stack Development']);
  const [preferredJobRoles, setPreferredJobRoles] = useState('Associate Software Engineer, Frontend Engineer');
  const [preferredLocations, setPreferredLocations] = useState('Remote, San Francisco, Bangalore');
  const [resumeUrl, setResumeUrl] = useState('');
  const [studentTerms, setStudentTerms] = useState(false);

  // Enterprise Company Form State (Phase 4 - All 21 Verification Fields)
  const [legalCompanyName, setLegalCompanyName] = useState(''); // 1
  const [brandName, setBrandName] = useState(''); // 2
  const [registrationNumber, setRegistrationNumber] = useState(''); // 3 (Tax ID / CIN)
  const [headquartersAddress, setHeadquartersAddress] = useState(''); // 4
  const [operatingLocation, setOperatingLocation] = useState(''); // 5
  const [website, setWebsite] = useState(''); // 6
  const [workEmail, setWorkEmail] = useState(''); // 7
  const [recruiterName, setRecruiterName] = useState(''); // 8
  const [recruiterTitle, setRecruiterTitle] = useState('Talent Acquisition Lead'); // 9
  const [recruiterPhone, setRecruiterPhone] = useState(''); // 10
  const [companySize, setCompanySize] = useState('201-1000 employees'); // 11
  const [industry, setIndustry] = useState('Technology & Software'); // 12
  const [about, setAbout] = useState(''); // 13
  const [linkedinUrl, setLinkedinUrl] = useState(''); // 14
  const [documentationUrl, setDocumentationUrl] = useState(''); // 15
  const [logoUrl, setLogoUrl] = useState(''); // 16
  const [hiringFocus, setHiringFocus] = useState<string[]>(['Full-time', 'Internships']); // 17
  const [recruitmentConsent, setRecruitmentConsent] = useState(false); // 18
  const [antiGhostingPledge, setAntiGhostingPledge] = useState(false); // 19
  const [equalOpportunityAffirmation, setEqualOpportunityAffirmation] = useState(false); // 20
  const [companyPassword, setCompanyPassword] = useState(''); // 21
  const [companyConfirmPassword, setCompanyConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Toggle skills
  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed]);
      setCustomSkillInput('');
    }
  };

  // Toggle interest
  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  // Toggle hiring focus
  const toggleHiringFocus = (focus: string) => {
    setHiringFocus((prev) =>
      prev.includes(focus) ? prev.filter((f) => f !== focus) : [...prev, focus]
    );
  };

  // Handle Student Registration Submit
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!studentName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!studentEmail.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    const strength = getPasswordStrength(studentPassword);
    if (strength.score < 2) {
      setErrorMsg('Please choose a stronger password meeting security guidelines.');
      return;
    }
    if (studentPassword !== studentConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!studentTerms) {
      setErrorMsg('Please review and accept the Terms of Service & Privacy Policy.');
      return;
    }

    try {
      setSubmitting(true);
      await registerStudent(studentEmail.trim(), studentPassword, studentName.trim(), {
        educationLevel,
        institution: institution.trim(),
        degree: degree.trim(),
        graduationYear,
        skills: selectedSkills,
        careerInterests: selectedInterests,
        preferredJobRoles: preferredJobRoles.split(',').map((r) => r.trim()).filter(Boolean),
        preferredLocations: preferredLocations.split(',').map((l) => l.trim()).filter(Boolean),
        resumeUrl: resumeUrl.trim(),
        careerGoals: `Targeting ${preferredJobRoles} positions with modern tech teams.`
      });
      navigate('/student/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email address already exists. Please log in.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('The password provided is too weak according to security criteria.');
      } else {
        setErrorMsg(err.message || 'Failed to complete registration.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Enterprise Company Registration Submit (21 Fields)
  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!legalCompanyName.trim()) {
      setErrorMsg('Please provide the official legal registered company name.');
      return;
    }
    if (!workEmail.trim()) {
      setErrorMsg('Please provide an official corporate work email address.');
      return;
    }

    // Verify enterprise domain
    const emailDomain = workEmail.split('@')[1]?.toLowerCase().trim();
    const disallowedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'mail.com'];
    if (emailDomain && disallowedDomains.includes(emailDomain)) {
      setErrorMsg('Notice: MNC enterprise recruiter registration requires an official organization domain email (e.g. name@company.com). Free personal webmail domains are not accepted for corporate verification.');
      return;
    }

    if (!recruiterName.trim()) {
      setErrorMsg('Please provide the recruiter or talent representative full name.');
      return;
    }

    const strength = getPasswordStrength(companyPassword);
    if (strength.score < 2) {
      setErrorMsg('Please choose a secure corporate password meeting length and complexity rules.');
      return;
    }
    if (companyPassword !== companyConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!recruitmentConsent) {
      setErrorMsg('You must certify authorized recruitment authority on behalf of your enterprise.');
      return;
    }
    if (!antiGhostingPledge) {
      setErrorMsg('Please agree to the platform Anti-Ghosting Recruitment Pledge.');
      return;
    }
    if (!equalOpportunityAffirmation) {
      setErrorMsg('Please affirm compliance with Equal Opportunity Employer standards.');
      return;
    }

    try {
      setSubmitting(true);
      await registerCompany(
        workEmail.trim(),
        companyPassword,
        {
          legalCompanyName: legalCompanyName.trim(),
          brandName: (brandName || legalCompanyName).trim(),
          registrationNumber: registrationNumber.trim(),
          headquartersAddress: headquartersAddress.trim(),
          operatingLocation: operatingLocation.trim() || 'Global',
          website: website.trim() || `https://${emailDomain || 'company.com'}`,
          recruiterName: recruiterName.trim(),
          recruiterTitle: recruiterTitle.trim() || 'Talent Acquisition Partner',
          recruiterPhone: recruiterPhone.trim(),
          companySize,
          industry,
          about: about.trim() || `${brandName || legalCompanyName} is an innovative enterprise building industry solutions and hiring top technical graduates.`,
          linkedinUrl: linkedinUrl.trim(),
          documentationUrl: documentationUrl.trim(),
          logoUrl: logoUrl.trim(),
          hiringFocus,
          recruitmentConsent,
          antiGhostingPledge,
          equalOpportunityAffirmation,
          location: operatingLocation.trim() || headquartersAddress.trim() || 'Global'
        }
      );
      navigate('/company/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this work email already exists. Please log in.');
      } else {
        setErrorMsg(err.message || 'Failed to complete company registration.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <Link to="/" className="flex justify-center items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <Briefcase className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {BRAND_CONFIG.name}
          </span>
        </Link>
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-slate-900">
          Create Your Platform Account
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-500">
          Join our verified network connecting high-performing candidates with top enterprises.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl space-y-6">
        {/* Role Toggle Tabs */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setRoleTab('student');
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              roleTab === 'student'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student / Job Seeker</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleTab('company');
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              roleTab === 'company'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>MNC Company / Recruiter</span>
          </button>
        </div>

        {/* Card Body */}
        <div className="bg-white py-8 px-6 shadow-xs rounded-2xl border border-slate-200 sm:px-10">
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PHASE 3: Student Registration Form */}
          {roleTab === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Candidate Account &amp; Identity
                </h3>
                <p className="text-xs text-slate-500">Provide your basic profile details and credentials.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="block w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="alex.morgan@university.edu"
                    className="block w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={studentConfirmPassword}
                      onChange={(e) => setStudentConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <PasswordStrengthMeter
                password={studentPassword}
                confirmPassword={studentConfirmPassword}
              />

              {/* Education Background */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      Academic Background
                    </h3>
                    <p className="text-xs text-slate-500">Helps recruiters understand your graduation schedule and program.</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Onboarding Info</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Education Level
                    </label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="w-full py-2.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Undergraduate">Undergraduate (B.Tech / B.S. / B.E.)</option>
                      <option value="Postgraduate">Postgraduate (M.Tech / M.S. / M.C.A.)</option>
                      <option value="Doctorate">Doctorate (Ph.D.)</option>
                      <option value="Diploma">Diploma / Associate Degree</option>
                      <option value="High School">High School Senior</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Degree / Major
                    </label>
                    <input
                      type="text"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science"
                      className="w-full py-2.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Graduation Year
                    </label>
                    <select
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="w-full py-2.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026 (Upcoming Graduate)</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College / Institution Name
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. National Institute of Technology / State University"
                    className="w-full py-2.5 px-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Basic Location & Profile Note */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location / City (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={preferredLocations}
                      onChange={(e) => setPreferredLocations(e.target.value)}
                      placeholder="e.g. San Francisco, CA or Bangalore / Remote"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Quick setup:</strong> You do not need to fill out dozens of technologies right now. You can configure target roles, projects, certifications, and portfolio details anytime inside your dashboard.
                  </p>
                </div>
              </div>

              {/* Consent and Submit */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <input
                    id="student-terms"
                    type="checkbox"
                    required
                    checked={studentTerms}
                    onChange={(e) => setStudentTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="student-terms" className="text-xs text-slate-600 leading-relaxed">
                    I agree to the <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>. I consent to my verified skill matrix and weekly assessment badges being discoverable by accredited enterprise recruiters.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Creating Student Profile...' : 'Complete Student Registration'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* PHASE 4: MNC Company & Recruiter Registration (All 21 Verification Fields) */}
          {roleTab === 'company' && (
            <form onSubmit={handleCompanySubmit} className="space-y-6">
              {/* Mandatory Enterprise Notice */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Enterprise Accreditation &amp; Recruiter Integrity Policy</span>
                </div>
                <p className="leading-relaxed text-amber-900/90">
                  To protect student candidates from fraudulent job listings and ghosting, all new enterprise accounts start in <strong>Pending Verification</strong> status. Our administrator reviews your corporate registration number, enterprise domain, and business presence before issuing a Verified Recruiter badge.
                </p>
              </div>

              {/* Section A: Company Identity & Legal Registration */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Fields 1 to 6 &bull; Corporate Entity
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">1. Company Entity &amp; Legal Verification</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      1. Legal Registered Entity Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={legalCompanyName}
                      onChange={(e) => setLegalCompanyName(e.target.value)}
                      placeholder="e.g. CloudScale Technologies Inc."
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      2. Operating Brand / Trade Name
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. CloudScale"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      3. Corporate Registration / Tax ID / CIN *
                    </label>
                    <input
                      type="text"
                      required
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="e.g. EIN 12-3456789 or CIN U72200..."
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      6. Official Website URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://company.com"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      4. Corporate Headquarters Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={headquartersAddress}
                      onChange={(e) => setHeadquartersAddress(e.target.value)}
                      placeholder="e.g. 100 Market St, Suite 400, San Francisco, CA"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      5. Primary Operating Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={operatingLocation}
                      onChange={(e) => setOperatingLocation(e.target.value)}
                      placeholder="e.g. North America / APAC / Global Hybrid"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section B: Recruiter & Representative Credentials */}
              <div className="space-y-4 border-t border-slate-100 pt-5">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Fields 7 to 10 &bull; Representative Information
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">2. Recruiter / HR Representative</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      7. Official Enterprise Domain Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      placeholder="jordan.miller@company.com"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Strict policy: Must match corporate domain (@company.com). Free webmail is prohibited.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      8. Recruiter Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={recruiterName}
                      onChange={(e) => setRecruiterName(e.target.value)}
                      placeholder="e.g. Jordan Miller"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      9. Recruiter Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={recruiterTitle}
                      onChange={(e) => setRecruiterTitle(e.target.value)}
                      placeholder="e.g. Senior Technical Talent Partner"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      10. Recruiter Direct Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={recruiterPhone}
                      onChange={(e) => setRecruiterPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section C: Enterprise Scope & Verification Evidence */}
              <div className="space-y-4 border-t border-slate-100 pt-5">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Fields 11 to 16 &bull; Enterprise Profile &amp; Verification Evidence
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">3. Organization Scale &amp; Verification Proof</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      11. Company Size / Employee Range *
                    </label>
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full py-2.5 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="10-50 employees">10 - 50 employees (Early Growth)</option>
                      <option value="51-200 employees">51 - 200 employees (Scaleup)</option>
                      <option value="201-1000 employees">201 - 1,000 employees (Mid Enterprise)</option>
                      <option value="1000-5000 employees">1,000 - 5,000 employees (Large Enterprise)</option>
                      <option value="5000+ employees">5,000+ employees (Global MNC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      12. Industry Sector *
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full py-2.5 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="Technology & Software">Technology &amp; Software</option>
                      <option value="Cloud & Infrastructure">Cloud &amp; Infrastructure</option>
                      <option value="Banking & FinTech">Banking &amp; FinTech</option>
                      <option value="Healthcare & BioTech">Healthcare &amp; BioTech</option>
                      <option value="E-Commerce & Logistics">E-Commerce &amp; Logistics</option>
                      <option value="Aerospace & Defense">Aerospace &amp; Defense</option>
                      <option value="Consulting & Digital Transformation">Consulting &amp; Digital Services</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    13. Company Overview &amp; Hiring Mission *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Describe your organization, engineering focus, and talent development programs..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      14. LinkedIn Company Page
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/company/..."
                      className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      15. Documentation / Registry Link
                    </label>
                    <input
                      type="url"
                      value={documentationUrl}
                      onChange={(e) => setDocumentationUrl(e.target.value)}
                      placeholder="Registry URL / Incorporation Doc"
                      className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      16. Company Logo URL
                    </label>
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://company.com/logo.png"
                      className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section D: Hiring Focus & Ethics Affirmations */}
              <div className="space-y-4 border-t border-slate-100 pt-5">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Fields 17 to 20 &bull; Recruiting Ethics &amp; Compliance
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">4. Hiring Scopes &amp; Platform Pledges</h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    17. Primary Hiring Focus (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Full-time', 'Internships', 'Remote Roles', 'Onsite / Hybrid'].map((focus) => {
                      const isSelected = hiringFocus.includes(focus);
                      return (
                        <button
                          key={focus}
                          type="button"
                          onClick={() => toggleHiringFocus(focus)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {focus}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-2.5">
                    <input
                      id="recruitment-consent"
                      type="checkbox"
                      required
                      checked={recruitmentConsent}
                      onChange={(e) => setRecruitmentConsent(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <label htmlFor="recruitment-consent" className="text-xs text-slate-700">
                      <strong>18. Authorized Recruitment Authority:</strong> I certify that I am legally authorized by {legalCompanyName || 'this organization'} to publish hiring listings and recruit talent.
                    </label>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <input
                      id="anti-ghosting"
                      type="checkbox"
                      required
                      checked={antiGhostingPledge}
                      onChange={(e) => setAntiGhostingPledge(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <label htmlFor="anti-ghosting" className="text-xs text-slate-700">
                      <strong>19. Anti-Ghosting Pledge:</strong> Our hiring team commits to transparent status communication and timely resolution of student candidate applications.
                    </label>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <input
                      id="equal-opp"
                      type="checkbox"
                      required
                      checked={equalOpportunityAffirmation}
                      onChange={(e) => setEqualOpportunityAffirmation(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <label htmlFor="equal-opp" className="text-xs text-slate-700">
                      <strong>20. Equal Opportunity Employer:</strong> We affirm adherence to fair hiring and anti-bias evaluation standards across all candidate reviews.
                    </label>
                  </div>
                </div>
              </div>

              {/* Section E: Secure Credentials */}
              <div className="space-y-4 border-t border-slate-100 pt-5">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Field 21 &bull; Account Security
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">5. Recruiter Portal Password</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      21. Secure Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={companyPassword}
                        onChange={(e) => setCompanyPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={companyConfirmPassword}
                        onChange={(e) => setCompanyConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <PasswordStrengthMeter
                  password={companyPassword}
                  confirmPassword={companyConfirmPassword}
                />
              </div>

              {/* Submit CTA */}
              <div className="border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Submitting Enterprise Application...' : 'Submit MNC Accreditation & Register'}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-center text-[11px] text-slate-400 mt-2">
                  Upon submission, your corporate profile will enter the administrator accreditation queue.
                </p>
              </div>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="mt-8 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an authorized account?{' '}
            <Link
              to={`/login?portal=${roleTab}`}
              className="font-bold text-blue-600 hover:text-blue-800"
            >
              Sign In to Your Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
