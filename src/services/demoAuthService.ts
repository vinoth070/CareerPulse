import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  User
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, CompanyProfile, JobPosting, JobApplication, AppNotification } from '../types';
import { INITIAL_DEMO_BADGES } from '../firebase/seedData';

export const DEMO_STUDENT_CREDENTIALS = {
  email: 'demo.student@careerpulse.internal',
  password: 'DemoStudent#2026!',
  name: 'Alex Vance (Demo Student)'
};

export const DEMO_COMPANY_CREDENTIALS = {
  email: 'demo.recruiter@demotech.internal',
  password: 'DemoRecruiter#2026!',
  name: 'Sarah Chen (Demo Recruiter)',
  companyName: 'DemoTech Solutions'
};

/**
 * Signs in as the Demo Student account with legitimate Firebase Auth credentials.
 * Provisions demo profile, badges, sample applications, and notifications idempotently.
 */
export async function loginAsDemoStudent(): Promise<User> {
  let user: User;

  try {
    const cred = await signInWithEmailAndPassword(
      auth,
      DEMO_STUDENT_CREDENTIALS.email,
      DEMO_STUDENT_CREDENTIALS.password
    );
    user = cred.user;
  } catch (err: any) {
    if (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/wrong-password'
    ) {
      try {
        const createCred = await createUserWithEmailAndPassword(
          auth,
          DEMO_STUDENT_CREDENTIALS.email,
          DEMO_STUDENT_CREDENTIALS.password
        );
        user = createCred.user;
      } catch (createErr: any) {
        if (createErr.code === 'auth/email-already-in-use') {
          // If already exists, attempt sign in once more
          const retryCred = await signInWithEmailAndPassword(
            auth,
            DEMO_STUDENT_CREDENTIALS.email,
            DEMO_STUDENT_CREDENTIALS.password
          );
          user = retryCred.user;
        } else {
          throw createErr;
        }
      }
    } else {
      throw err;
    }
  }

  await updateProfile(user, { displayName: DEMO_STUDENT_CREDENTIALS.name });

  // Ensure idempotent initialization of demo student profile
  await initializeDemoStudentData(user.uid, user.email || DEMO_STUDENT_CREDENTIALS.email);

  return user;
}

/**
 * Signs in as the Demo Recruiter account with legitimate Firebase Auth credentials.
 * Provisions demo recruiter profile, "DemoTech Solutions" company profile, sample jobs,
 * applicant pipeline, and notifications idempotently.
 */
export async function loginAsDemoCompany(): Promise<User> {
  let user: User;

  try {
    const cred = await signInWithEmailAndPassword(
      auth,
      DEMO_COMPANY_CREDENTIALS.email,
      DEMO_COMPANY_CREDENTIALS.password
    );
    user = cred.user;
  } catch (err: any) {
    if (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/wrong-password'
    ) {
      try {
        const createCred = await createUserWithEmailAndPassword(
          auth,
          DEMO_COMPANY_CREDENTIALS.email,
          DEMO_COMPANY_CREDENTIALS.password
        );
        user = createCred.user;
      } catch (createErr: any) {
        if (createErr.code === 'auth/email-already-in-use') {
          const retryCred = await signInWithEmailAndPassword(
            auth,
            DEMO_COMPANY_CREDENTIALS.email,
            DEMO_COMPANY_CREDENTIALS.password
          );
          user = retryCred.user;
        } else {
          throw createErr;
        }
      }
    } else {
      throw err;
    }
  }

  await updateProfile(user, { displayName: DEMO_COMPANY_CREDENTIALS.name });

  // Ensure idempotent initialization of DemoTech Solutions & candidate pipeline
  await initializeDemoCompanyData(user.uid, user.email || DEMO_COMPANY_CREDENTIALS.email);

  return user;
}

/**
 * Idempotently creates demo student profile and mock applications
 */
async function initializeDemoStudentData(uid: string, email: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const demoProfile: UserProfile & { isDemo: boolean } = {
      uid,
      email,
      role: 'student',
      roles: ['student'],
      displayName: 'Alex Vance (Demo Student)',
      headline: 'Undergraduate Computer Science Senior | Aspiring Full-Stack Software Engineer',
      bio: 'Demonstration profile for exploring FresherNexus candidate features, verified badges, live assessments, and application workflows.',
      about: 'Passionate about distributed web platforms, TypeScript, and clean software architecture. Active participant in weekly technical assessments.',
      educationLevel: 'Undergraduate',
      degree: 'B.Tech in Computer Science & Engineering',
      institution: 'Metropolitan Institute of Technology (Demo)',
      graduationYear: '2026',
      country: 'United States',
      city: 'San Francisco',
      skills: ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'System Fundamentals'],
      softSkills: ['Problem Solving', 'Structured Communication', 'Collaborative Development'],
      projects: [
        {
          id: 'proj-demo-1',
          title: 'Distributed Real-Time Telemetry Pipeline',
          description: 'A fault-tolerant stream processing demo with WebSocket fan-out, Redis caching, and interactive React analytics.',
          technologies: ['React', 'TypeScript', 'Node.js', 'Redis', 'Tailwind CSS'],
          link: 'https://github.com/example/telemetry-pipeline-demo'
        },
        {
          id: 'proj-demo-2',
          title: 'Autonomous Code Review Assistant',
          description: 'Microservice examining pull request ASTs to flag security bottlenecks and maintainability debt.',
          technologies: ['Python', 'FastAPI', 'Docker', 'PostgreSQL'],
          link: 'https://github.com/example/code-review-assistant'
        }
      ],
      certifications: [
        {
          id: 'cert-demo-1',
          title: 'AWS Certified Cloud Practitioner (Demo Accreditation)',
          issuer: 'Amazon Web Services',
          year: '2025',
          credentialUrl: 'https://aws.amazon.com/verification',
          verificationStatus: 'verified'
        }
      ],
      careerInterests: ['Full-Stack Development', 'Cloud Architecture', 'DevOps & Tooling'],
      preferredJobRoles: ['Associate Software Engineer', 'Full-Stack Developer', 'Frontend Engineer'],
      preferredLocations: ['Remote', 'San Francisco, CA', 'New York, NY', 'Bangalore'],
      profileVisibility: 'public',
      profileCompleted: true,
      verifiedBadges: INITIAL_DEMO_BADGES,
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(userRef, demoProfile);
  }

  // Check and seed sample applications for demo student
  const appQuery = query(collection(db, 'applications'), where('candidateUid', '==', uid));
  const appSnap = await getDocs(appQuery);

  if (appSnap.empty) {
    const sampleStudentApps: (JobApplication & { isDemo: boolean })[] = [
      {
        id: `app-demo-std-1-${uid.slice(0, 5)}`,
        jobId: 'demo-job-fullstack',
        jobTitle: 'Associate Full-Stack Software Engineer (Demo Listing)',
        companyId: 'comp-demotech-solutions',
        companyName: 'DemoTech Solutions',
        candidateUid: uid,
        candidateName: 'Alex Vance (Demo Student)',
        candidateEmail: email,
        candidateDegree: 'B.Tech Computer Science',
        candidateInstitution: 'Metropolitan Institute of Technology (Demo)',
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        matchScore: 94,
        coverNote: 'Excited to apply my distributed telemetry projects and TypeScript skills to DemoTech Solutions full-stack team.',
        status: 'interview_scheduled',
        interviewDetails: {
          scheduledDate: 'Tomorrow at 10:30 AM PST',
          scheduledTime: '10:30 AM - 11:30 AM',
          interviewType: 'technical',
          meetingLink: 'https://meet.google.com/demo-tech-room',
          interviewerName: 'Sarah Chen',
          interviewerTitle: 'Engineering Lead @ DemoTech Solutions',
          notes: 'Prepare a 15-minute walkthrough of your Real-Time Telemetry Pipeline project followed by interactive system design.',
          roundNumber: 2
        },
        isDemo: true,
        appliedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `app-demo-std-2-${uid.slice(0, 5)}`,
        jobId: 'demo-job-cloud',
        jobTitle: 'Cloud Infrastructure Associate (Demo Listing)',
        companyId: 'comp-demotech-solutions',
        companyName: 'DemoTech Solutions',
        candidateUid: uid,
        candidateName: 'Alex Vance (Demo Student)',
        candidateEmail: email,
        skills: ['Python', 'Docker', 'AWS'],
        matchScore: 88,
        coverNote: 'Eager to build scalable cloud pipelines with verified infrastructure best practices.',
        status: 'offer_issued',
        joiningDetails: {
          offerRole: 'Associate Cloud Engineer (Demo Offer)',
          salaryPackage: '$98,000 / year + Comprehensive Benefits (Demo)',
          expectedJoiningDate: 'July 15, 2026',
          officeLocation: 'San Francisco, CA (Hybrid)',
          officeAddress: '100 Innovation Way, Suite 400, San Francisco, CA',
          googleMapsUrl: 'https://maps.google.com/?q=San+Francisco+Financial+District',
          reportingManager: 'Sarah Chen, VP Engineering',
          recruiterContactEmail: 'recruiting@demotech.internal',
          welcomeMessage: 'Congratulations! The interview panel was thoroughly impressed by your Weekly Assessment badges and clean code practices.',
          workMode: 'hybrid',
          onboardingChecklist: [
            { id: 't1', label: 'Review and sign standard employment offer letter', completed: false, dueDate: 'Within 5 business days' },
            { id: 't2', label: 'Submit university degree completion certificate or provisional marksheet', completed: false },
            { id: 't3', label: 'Complete IT hardware delivery preference form', completed: true }
          ]
        },
        isDemo: true,
        appliedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `app-demo-std-3-${uid.slice(0, 5)}`,
        jobId: 'demo-job-frontend',
        jobTitle: 'Frontend UI/UX Engineering Intern (Demo Listing)',
        companyId: 'comp-demotech-solutions',
        companyName: 'DemoTech Solutions',
        candidateUid: uid,
        candidateName: 'Alex Vance (Demo Student)',
        candidateEmail: email,
        skills: ['React', 'TypeScript', 'Tailwind CSS'],
        matchScore: 91,
        coverNote: 'Specializing in accessible, responsive web interfaces with pixel-perfect UI craftsmanship.',
        status: 'applied',
        isDemo: true,
        appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const app of sampleStudentApps) {
      await setDoc(doc(db, 'applications', app.id), app);
    }
  }

  // Check and seed sample notifications for demo student
  const notifQuery = query(collection(db, 'notifications'), where('recipientUid', '==', uid));
  const notifSnap = await getDocs(notifQuery);

  if (notifSnap.empty) {
    const sampleNotifications: (AppNotification & { isDemo: boolean })[] = [
      {
        id: `notif-demo-1-${Date.now()}`,
        recipientUid: uid,
        senderName: 'DemoTech Solutions',
        type: 'interview_scheduled',
        title: 'Interview Invitation: Round 2 System Architecture',
        message: 'Sarah Chen from DemoTech Solutions has invited you to Round 2 System Architecture for Associate Full-Stack Engineer. Scheduled for tomorrow at 10:30 AM PST.',
        read: false,
        link: '/student/opportunities',
        isDemo: true,
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
      },
      {
        id: `notif-demo-2-${Date.now()}`,
        recipientUid: uid,
        senderName: 'DemoTech Solutions',
        type: 'application_update',
        title: 'Formal Offer Issued: Associate Cloud Engineer',
        message: 'Congratulations! DemoTech Solutions has officially issued an employment offer. Review your compensation package, onboarding checklist, and joining details.',
        read: false,
        link: '/student/opportunities',
        isDemo: true,
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
      },
      {
        id: `notif-demo-3-${Date.now()}`,
        recipientUid: uid,
        senderName: 'CareerPulse Assessment Board',
        type: 'system',
        title: 'Assessment Badge Verified: Full-Stack Architecture Specialist',
        message: 'Your score of 92% in the Weekly System Fundamentals assessment has been audited and verified. A permanent Gold badge has been appended to your public candidate profile.',
        read: true,
        link: '/student/portfolio',
        isDemo: true,
        createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
      }
    ];

    for (const notif of sampleNotifications) {
      await setDoc(doc(db, 'notifications', notif.id), notif);
    }
  }
}

/**
 * Idempotently creates DemoTech Solutions company profile, sample jobs, and applicant pipeline
 */
async function initializeDemoCompanyData(uid: string, email: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const demoRecruiterProfile: UserProfile & { isDemo: boolean } = {
      uid,
      email,
      role: 'company',
      roles: ['company'],
      displayName: 'Sarah Chen (Demo Recruiter)',
      headline: 'Lead Technical Talent Partner at DemoTech Solutions (Fictional Organization)',
      bio: 'Recruiter account for evaluating candidate applications, managing interview pipelines, reviewing rubric assessments, and exploring employer portal features.',
      profileVisibility: 'private',
      profileCompleted: true,
      skills: ['Talent Sourcing', 'Engineering Assessments', 'Pipeline Management', 'Rubric Evaluation'],
      softSkills: ['Transparent Communication', 'Candidate Experience', 'Anti-Ghosting Adherence'],
      projects: [],
      certifications: [],
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(userRef, demoRecruiterProfile);
  }

  const compRef = doc(db, 'companies', uid);
  const compSnap = await getDoc(compRef);

  if (!compSnap.exists()) {
    const demoCompany: CompanyProfile & { isDemo: boolean } = {
      id: uid,
      ownerUid: uid,
      companyName: 'DemoTech Solutions',
      legalCompanyName: 'DemoTech Solutions Global Technologies Inc.',
      brandName: 'DemoTech Solutions',
      registrationNumber: 'DEMO-REG-882910-US',
      headquartersAddress: '500 Tech Boulevard, Silicon Valley, CA 94025',
      operatingLocation: 'Global / Hybrid',
      recruiterName: 'Sarah Chen',
      recruiterTitle: 'Lead University & Early-Career Talent Partner',
      recruiterPhone: '+1 (555) 019-2834',
      workEmail: email,
      industry: 'Cloud Infrastructure & Enterprise Software',
      companySize: '500-1000 employees',
      website: 'https://demotech-solutions.example.internal',
      location: 'San Francisco, CA & Remote',
      about: 'DEMO COMPANY — FICTIONAL ORGANIZATION — NOT A VERIFIED REAL EMPLOYER. DemoTech Solutions is an illustrative enterprise created specifically to demonstrate recruitment dashboards, job listing creation, anti-ghosting application workflows, and interview fairness scoring without affecting real companies or applicants.',
      hiringFocus: ['Full-time Software Engineers', 'Cloud DevOps Associates', 'Frontend UI Interns'],
      recruitmentConsent: true,
      antiGhostingPledge: true,
      equalOpportunityAffirmation: true,
      verificationStatus: 'verified',
      verificationNotes: 'Official internal demonstration workspace for employer capabilities.',
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(compRef, demoCompany);
  }

  // Check and seed sample jobs for DemoTech Solutions
  const jobsQuery = query(collection(db, 'jobs'), where('companyId', '==', uid));
  const jobsSnap = await getDocs(jobsQuery);

  if (jobsSnap.empty) {
    const demoJobs: (JobPosting & { isDemo: boolean })[] = [
      {
        id: `demo-job-1-${uid.slice(0, 5)}`,
        companyId: uid,
        companyName: 'DemoTech Solutions',
        companyLogo: '',
        title: 'Associate Full-Stack Software Engineer (Demo Listing)',
        employmentType: 'full-time',
        location: 'San Francisco, CA / Remote',
        department: 'Core Platform Engineering',
        experienceLevel: 'entry',
        eligibility: 'Bachelor’s degree in Computer Science, Software Engineering, or related technical field (Class of 2025/2026)',
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        salaryRange: '$90,000 - $115,000 / year',
        isRemote: true,
        isHybrid: true,
        description: 'DEMO LISTING — FICTIONAL VACANCY. Join DemoTech Solutions core platform team to build resilient APIs, distributed event streams, and reactive web applications.',
        requiredSkills: ['React', 'TypeScript', 'Node.js', 'SQL', 'Git'],
        preferredSkills: ['PostgreSQL', 'Docker', 'Redis', 'AWS'],
        status: 'active',
        isDemo: true,
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `demo-job-2-${uid.slice(0, 5)}`,
        companyId: uid,
        companyName: 'DemoTech Solutions',
        title: 'Frontend UI/UX Software Intern (Demo Listing)',
        employmentType: 'internship',
        location: 'Remote (US/Canada)',
        department: 'Design Systems',
        experienceLevel: 'intern',
        eligibility: 'Current undergraduate or graduate students pursuing Computer Science or related design disciplines',
        deadline: new Date(Date.now() + 45 * 86400000).toISOString(),
        salaryRange: '$40 - $55 / hour',
        isRemote: true,
        description: 'DEMO LISTING — FICTIONAL VACANCY. Summer internship focused on modern design systems, micro-interactions, and high-performance Web animations using Tailwind CSS and React.',
        requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'CSS Architecture'],
        preferredSkills: ['Figma', 'Accessibility (a11y)', 'Jest'],
        status: 'active',
        isDemo: true,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const job of demoJobs) {
      await setDoc(doc(db, 'jobs', job.id), job);
    }
  }

  // Check and seed candidate applications for DemoTech Solutions
  const appsQuery = query(collection(db, 'applications'), where('companyId', '==', uid));
  const appsSnap = await getDocs(appsQuery);

  if (appsSnap.empty) {
    const demoCandidatesPipeline: (JobApplication & { isDemo: boolean })[] = [
      {
        id: `app-demo-rec-1-${uid.slice(0, 5)}`,
        jobId: `demo-job-1-${uid.slice(0, 5)}`,
        jobTitle: 'Associate Full-Stack Software Engineer (Demo Listing)',
        companyId: uid,
        companyName: 'DemoTech Solutions',
        candidateUid: 'cand-demo-elena',
        candidateName: 'Elena Rostova (Demo Candidate)',
        candidateEmail: 'elena.rostova.demo@university.edu',
        candidateDegree: 'M.S. Distributed Systems',
        candidateInstitution: 'ETH Zürich (Demo)',
        skills: ['React', 'TypeScript', 'Go', 'PostgreSQL', 'Docker'],
        matchScore: 96,
        coverNote: 'Extensive hands-on experience in building CRDT sync engines and reactive UI clients.',
        status: 'interview_scheduled',
        interviewDetails: {
          scheduledDate: 'Oct 29, 2026, 2:00 PM EST',
          scheduledTime: '2:00 PM - 3:00 PM',
          interviewType: 'technical',
          meetingLink: 'https://meet.google.com/demo-elena-interview',
          interviewerName: 'Sarah Chen',
          interviewerTitle: 'Technical Recruiter',
          notes: 'Focus on distributed consensus, data structures, and practical TypeScript generics.',
          roundNumber: 1
        },
        isDemo: true,
        appliedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `app-demo-rec-2-${uid.slice(0, 5)}`,
        jobId: `demo-job-1-${uid.slice(0, 5)}`,
        companyId: uid,
        companyName: 'DemoTech Solutions',
        candidateUid: 'cand-demo-aarav',
        candidateName: 'Aarav Sharma (Demo Candidate)',
        candidateEmail: 'aarav.sharma.demo@university.edu',
        candidateDegree: 'B.Tech Computer Science & Engineering',
        candidateInstitution: 'National Institute of Technology (Demo)',
        skills: ['React', 'TypeScript', 'Python', 'SQL'],
        matchScore: 91,
        coverNote: 'Completed Week 42 System Fundamentals with 90%+ score. Ready to contribute immediately.',
        status: 'under_review',
        isDemo: true,
        appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `app-demo-rec-3-${uid.slice(0, 5)}`,
        jobId: `demo-job-2-${uid.slice(0, 5)}`,
        companyId: uid,
        companyName: 'DemoTech Solutions',
        candidateUid: 'cand-demo-priya',
        candidateName: 'Priya Lakshman (Demo Candidate)',
        candidateEmail: 'priya.lakshman.demo@university.edu',
        candidateDegree: 'B.S. Software Engineering',
        candidateInstitution: 'State University (Demo)',
        skills: ['React', 'Tailwind CSS', 'TypeScript', 'Figma'],
        matchScore: 89,
        coverNote: 'Designed multiple accessible component libraries and audited WCAG contrast standards.',
        status: 'shortlisted',
        isDemo: true,
        appliedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `app-demo-rec-4-${uid.slice(0, 5)}`,
        jobId: `demo-job-1-${uid.slice(0, 5)}`,
        companyId: uid,
        companyName: 'DemoTech Solutions',
        candidateUid: 'cand-demo-liam',
        candidateName: 'Liam O’Connor (Demo Candidate)',
        candidateEmail: 'liam.oconnor.demo@college.edu',
        candidateDegree: 'B.S. Information Systems',
        candidateInstitution: 'Trinity College (Demo)',
        skills: ['Node.js', 'React', 'MongoDB'],
        matchScore: 82,
        coverNote: 'Excited about modern web architectures and full-stack software development.',
        status: 'applied',
        isDemo: true,
        appliedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const app of demoCandidatesPipeline) {
      await setDoc(doc(db, 'applications', app.id), app);
    }
  }

  // Check and seed sample notifications for demo recruiter
  const notifQuery = query(collection(db, 'notifications'), where('recipientUid', '==', uid));
  const notifSnap = await getDocs(notifQuery);

  if (notifSnap.empty) {
    const demoRecruiterNotifications: (AppNotification & { isDemo: boolean })[] = [
      {
        id: `notif-rec-1-${Date.now()}`,
        recipientUid: uid,
        senderName: 'Platform Sourcing Engine',
        type: 'application_update',
        title: 'New High-Match Applicant: Elena Rostova',
        message: 'Elena Rostova applied for Associate Full-Stack Software Engineer with a 96% skill matrix match score and verified Assessment Badges.',
        read: false,
        link: '/company/jobs',
        isDemo: true,
        createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
      },
      {
        id: `notif-rec-2-${Date.now()}`,
        recipientUid: uid,
        senderName: 'Fairness & Anti-Ghosting Service',
        type: 'system',
        title: 'Employer Verification & Anti-Ghosting Pledge Confirmed',
        message: 'DemoTech Solutions is configured with active Anti-Ghosting SLA monitoring. All applicants will receive transparent milestone notifications within 7 business days.',
        read: true,
        link: '/company/dashboard',
        isDemo: true,
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
      }
    ];

    for (const notif of demoRecruiterNotifications) {
      await setDoc(doc(db, 'notifications', notif.id), notif);
    }
  }
}
