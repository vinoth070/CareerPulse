export type UserRole = 'student' | 'company' | 'admin' | 'reviewer';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'more_info_required' | 'suspended';

export type ProfileVisibility = 'public' | 'private';

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  year: string;
  credentialUrl?: string;
  verificationStatus?: 'unverified' | 'verified';
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
  type: 'full-time' | 'internship' | 'part-time';
}

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  roles?: UserRole[]; // Explicitly authorized multiple roles
  displayName: string;
  headline?: string; // e.g. "Computer Science Honors Senior | Aspiring Full-Stack Engineer"
  bio?: string;
  about?: string;
  educationLevel?: string; // 'Undergraduate', 'Postgraduate', etc.
  degree?: string; // e.g. 'B.Tech in Computer Science'
  institution?: string; // e.g. 'State University of Technology'
  graduationYear?: string;
  country?: string;
  city?: string;
  skills: string[];
  softSkills: string[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  experiences?: ExperienceItem[];
  internships?: ExperienceItem[];
  achievements?: string[];
  languages?: string[];
  portfolioLinks?: { label: string; url: string }[];
  careerGoals?: string;
  targetRole?: string;
  targetCompany?: string; // e.g. 'Google', 'Stripe', 'CloudScale Technologies'
  careerInterests?: string[];
  preferredJobRoles?: string[];
  workplacePreferences?: { remote: boolean; hybrid: boolean; onsite: boolean };
  preferredLocations?: string[];
  savedJobIds?: string[];
  savedPostIds?: string[];
  followingCompanies?: string[];
  connectionsCount?: number;
  profileVisibility: ProfileVisibility;
  profileCompleted: boolean;
  avatarUrl?: string;
  photoUrl?: string;
  major?: string;
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  experience?: ExperienceItem[];
  quizHistory?: QuizAttempt[];
  verifiedBadges?: DigitalBadge[];
  documents?: { id: string; name: string; url: string; type: string; uploadedAt: string }[];
  badges?: DigitalBadge[];
  createdAt: string;
  updatedAt: string;
}

export interface CompanyProfile {
  id: string;
  ownerUid: string;
  companyName: string;
  legalCompanyName?: string; // 1. Legal registered company name
  brandName?: string; // 2. Operating brand name
  registrationNumber?: string; // 3. Corporate registration / Tax ID
  headquartersAddress?: string; // 4. Corporate headquarters address
  operatingLocation?: string; // 5. Primary operating location
  website: string; // 6. Official website URL
  workEmail: string; // 7. Official enterprise domain work email
  recruiterName: string; // 8. Recruiter full name
  recruiterTitle?: string; // 9. Recruiter job title
  recruiterPhone?: string; // 10. Recruiter direct phone
  companySize?: string; // 11. Employee count range
  industry: string; // 12. Industry sector
  about: string; // 13. Company description / overview
  linkedinUrl?: string; // 14. LinkedIn company page
  documentationUrl?: string; // 15. Official documentation upload / registry link
  logoUrl?: string; // 16. Company logo URL
  hiringFocus?: string[]; // 17. Hiring focus: Full-time, Internships, Remote, Onsite
  recruitmentConsent?: boolean; // 18. Authorized recruitment consent
  antiGhostingPledge?: boolean; // 19. Anti-ghosting pledge
  equalOpportunityAffirmation?: boolean; // 20. Equal opportunity affirmation
  location: string;
  country?: string;
  name?: string;
  description?: string;
  size?: string;
  followersCount?: number;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  bannerUrl?: string;
  createdAt: string;
  updatedAt: string;
}


// Professional Networking Types
export interface ConnectionRequest {
  id: string;
  senderUid: string;
  senderName: string;
  senderAvatar?: string;
  senderRole: UserRole;
  senderHeadline?: string;
  recipientUid: string;
  recipientName: string;
  fromUid?: string;
  fromName?: string;
  fromHeadline?: string;
  fromPhotoUrl?: string;
  toUid?: string;
  toName?: string;
  toHeadline?: string;
  toPhotoUrl?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}

export interface FeedPost {
  id: string;
  authorUid: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  authorHeadline?: string;
  content: string;
  mediaUrl?: string;
  attachment?: { title: string; url: string; type: string };
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  likedBy?: string[];
  savedBy?: string[];
  visibility: 'public' | 'connections';
  reportedBy?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorUid: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderUid: string;
  senderName?: string;
  senderAvatar?: string;
  recipientUid: string;
  text: string;
  attachmentUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantUids?: string[];
  participants?: string[];
  participantDetails?: Record<string, any>;
  lastMessage?: string;
  lastMessageText?: string;
  lastMessageSenderUid?: string;
  lastMessageTimestamp?: string;
  unreadCount?: Record<string, number>;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  recipientUid: string;
  senderName?: string;
  type: 'connection_request' | 'connection_accepted' | 'application_update' | 'interview_scheduled' | 'challenge_update' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}


export interface JobFitAnalysis {
  overallScore?: number;
  overallPercentage?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  breakdown?: { category: string; score: number; maxScore: number; details: string }[];
  recommendations?: string[];
  requiredSkillsMatched?: string[];
  requiredSkillsMissing?: string[];
  preferredSkillsMatched?: string[];
  qualificationMatchScore?: number;
  requiredSkillMatchScore?: number;
  experienceMatchScore?: number;
  projectEvidenceScore?: number;
  certificationMatchScore?: number;
  assessmentMatchScore?: number;
  missingEvidenceDetails?: string[];
  suggestedImprovements?: string[];
  disclaimer: string;
  readinessCategory?: 'High Readiness' | 'Moderate Fit with High Potential' | 'Foundation Development Needed';
}


export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  skillTag: string;
}

export interface Quiz {
  id: string;
  title: string;
  weekNumber: number;
  description: string;
  category: string;
  timeLimitMinutes: number;
  totalQuestions: number;
  status: 'active' | 'archived' | 'upcoming';
  questions: QuizQuestion[];
  targetRole?: string;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Record<string, number>;
  skillsEvaluated: string[];
  feedback: string;
  submittedAt: string;
}

export type EmploymentType = 'full-time' | 'part-time' | 'internship' | 'contract';

export interface JobPosting {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  department?: string;
  description: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  eligibility: string;
  location: string;
  country?: string;
  city?: string;
  isRemote?: boolean;
  isHybrid?: boolean;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'graduate' | 'intern';
  employmentType: EmploymentType;
  deadline: string;
  status: 'active' | 'closed';
  salaryRange?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 
  | 'draft'
  | 'applied' 
  | 'under_review' 
  | 'shortlisted' 
  | 'assessment'
  | 'interview'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'offer_pending'
  | 'offer_issued'
  | 'offer_accepted'
  | 'hired'
  | 'joining_info_available'
  | 'selected' 
  | 'rejected'
  | 'withdrawn';

export interface OnboardingTask {
  id: string;
  label: string;
  completed: boolean;
  dueDate?: string;
}

export interface JoiningDocument {
  id: string;
  name: string;
  submitted: boolean;
  mandatory: boolean;
  verified?: boolean;
}

export interface JoiningDetails {
  offerRole?: string;
  salaryPackage?: string;
  expectedJoiningDate?: string;
  officeLocation?: string;
  officeAddress?: string;
  googleMapsUrl?: string;
  reportingManager?: string;
  recruiterContactEmail?: string;
  recruiterContactPhone?: string;
  onboardingChecklist?: OnboardingTask[];
  requiredDocuments?: JoiningDocument[];
  offerLetterUrl?: string;
  welcomeMessage?: string;
  workMode?: 'onsite' | 'hybrid' | 'remote';
}

export interface InterviewDetails {
  scheduledDate?: string;
  scheduledTime?: string;
  interviewType?: 'technical' | 'hr' | 'system_design' | 'behavioral' | 'executive';
  meetingLink?: string;
  interviewerName?: string;
  interviewerTitle?: string;
  notes?: string;
  roundNumber?: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle?: string;
  companyId: string;
  companyName?: string;
  candidateUid: string;
  candidateName: string;
  candidateEmail: string;
  candidateDegree?: string;
  candidateInstitution?: string;
  skills: string[];
  matchScore?: number;
  coverNote?: string;
  resumeVersion?: string;
  status: ApplicationStatus;
  statusHistory?: { status: ApplicationStatus; changedAt: string; note?: string }[];
  interviewDetails?: InterviewDetails;
  joiningDetails?: JoiningDetails;
  feedbackNote?: string;
  appliedAt: string;
  updatedAt: string;
}

// Company Updates Feed
export interface CompanyUpdate {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  category: 'job_announcement' | 'internship_opening' | 'recruitment_drive' | 'hackathon' | 'general_notice';
  description: string;
  requiredSkills?: string[];
  eligibility?: string;
  location?: string;
  deadline?: string;
  publishedAt?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// Hackathons & Technical Challenges
export interface Hackathon {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  problemStatement: string;
  description: string;
  category: string;
  requiredSkills: string[];
  eligibility: string;
  teamSizeMax: number;
  startDate: string;
  deadline: string;
  endDate?: string;
  prizePool?: string;
  evaluationCriteria: string[];
  prizeReward?: string;
  allowedFormats: string[];
  status: 'active' | 'closed';
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface HackathonSubmission {
  id: string;
  hackathonId: string;
  hackathonTitle: string;
  companyId: string;
  candidateUid: string;
  candidateName: string;
  candidateEmail: string;
  teamName?: string;
  solutionTitle: string;
  solutionDescription: string;
  githubRepoUrl?: string;
  liveDemoUrl?: string;
  documentUrl?: string;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'awarded' | 'rejected';
  score?: number;
  rubricScores?: Record<string, number>;
  feedback?: string;
  submittedAt: string;
  evaluatedAt?: string;
}

// Online Live Interviews
export interface InterviewQuestionConfig {
  id: string;
  questionText: string;
  competency: string;
  expectedIndicators: string;
  maxScore: number;
}

export interface AntiCheatingEvent {
  timestamp: string;
  eventType: 'session_joined' | 'tab_blur' | 'tab_focus' | 'code_draft_saved' | 'response_submitted' | 'technical_issue_reported';
  details: string;
}

export interface InterviewRecord {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  candidateUid: string;
  candidateName: string;
  candidateEmail: string;
  scheduledDate: string;
  scheduledTime: string;
  stage: 'Technical Round 1' | 'System Architecture' | 'Live Coding' | 'Problem Solving' | 'Final HR';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  questions: InterviewQuestionConfig[];
  candidateResponses?: Record<string, string>;
  candidateNotes?: string;
  rubricScores?: Record<string, number>; // questionId -> 0..4
  reviewerNotes?: string;
  totalScore?: number;
  maxScore?: number;
  feedbackReleased: boolean;
  candidateFeedback?: string;
  strengths?: string;
  improvements?: string;
  logs?: AntiCheatingEvent[];
  createdAt: string;
  updatedAt: string;
}

// Fairness Reviewer Audit Record
export interface FairnessReviewAudit {
  id: string;
  interviewId: string;
  jobTitle: string;
  companyName: string;
  candidateName: string;
  reviewerUid: string;
  reviewerName: string;
  outcome: 'no_concern' | 'potential_concern' | 'insufficient_evidence';
  evidenceNotes: string;
  severity: 'low' | 'medium' | 'high';
  recommendedAction: string;
  reviewedAt: string;
}

// Support & Complaints Ticket
export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  category: 'technical_problem' | 'suspicious_job' | 'interview_concern' | 'challenge_dispute' | 'general';
  subject: string;
  description: string;
  attachmentUrl?: string;
  status: 'open' | 'in_review' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

// Digital Badge Visual System
export type BadgeTier = 'gold' | 'silver' | 'bronze' | 'verified';
export type BadgeCategory = 'quiz_excellence' | 'verified_certification' | 'hackathon_achievement' | 'core_competency';

export interface DigitalBadge {
  id: string;
  title: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  iconName: string;
  issuedBy: string;
  earnedDate: string;
  verificationId: string;
  criteria: string;
  scoreOrMetric?: string;
}

// Target Company Career Assistant Plan
export interface CareerTargetPlan {
  id: string;
  userId: string;
  targetCompany: string;
  targetRole: string;
  location: string;
  analyzedAt: string;
  matchScore: number;
  demonstratedSkills: string[];
  selfDeclaredSkills: string[];
  missingSkills: { skill: string; reason: string; priority: 'essential' | 'high' | 'medium' }[];
  weeklyPlan: {
    week: number;
    title: string;
    description: string;
    tasks: { id: string; label: string; completed: boolean; type: 'quiz' | 'project' | 'reading' | 'resume' }[];
  }[];
  resumeSuggestions: {
    category: 'missing_evidence' | 'structural' | 'impact_metric';
    suggestion: string;
  }[];
}
