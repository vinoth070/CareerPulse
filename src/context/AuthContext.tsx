import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, OperationType, handleFirestoreError } from '../firebase/config';
import { UserProfile, CompanyProfile, UserRole } from '../types';
import { loginAsDemoStudent, loginAsDemoCompany } from '../services/demoAuthService';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  companyProfile: CompanyProfile | null;
  role: UserRole | null;
  authorizedRoles: UserRole[];
  loading: boolean;
  isAuthorizedForRole: (targetRole: UserRole) => boolean;
  registerStudent: (
    email: string,
    password: string,
    fullName: string,
    additionalDetails?: {
      educationLevel?: string;
      degree?: string;
      institution?: string;
      graduationYear?: string;
      skills?: string[];
      careerInterests?: string[];
      preferredJobRoles?: string[];
      preferredLocations?: string[];
      resumeUrl?: string;
      careerGoals?: string;
    }
  ) => Promise<void>;
  registerCompany: (
    workEmail: string,
    password: string,
    recruiterOrDetails:
      | string
      | {
          legalCompanyName: string;
          brandName?: string;
          registrationNumber?: string;
          headquartersAddress?: string;
          operatingLocation?: string;
          website: string;
          recruiterName: string;
          recruiterTitle?: string;
          recruiterPhone?: string;
          companySize?: string;
          industry: string;
          about: string;
          linkedinUrl?: string;
          documentationUrl?: string;
          logoUrl?: string;
          hiringFocus?: string[];
          recruitmentConsent?: boolean;
          antiGhostingPledge?: boolean;
          equalOpportunityAffirmation?: boolean;
          location?: string;
        },
    companyName?: string,
    industry?: string,
    website?: string,
    location?: string
  ) => Promise<void>;
  registerReviewer: (email: string, password: string, fullName: string, institution: string) => Promise<void>;
  switchDemoRole: (targetRole: UserRole) => void;
  loginWithEmail: (email: string, password: string) => Promise<{
    user: User;
    profile: UserProfile;
    companyProfile: CompanyProfile | null;
    authorizedRoles: UserRole[];
  }>;
  loginWithGoogle: () => Promise<{
    user: User;
    profile: UserProfile;
    companyProfile: CompanyProfile | null;
    authorizedRoles: UserRole[];
  }>;
  loginDemoStudent: () => Promise<{
    user: User;
    profile: UserProfile;
    companyProfile: CompanyProfile | null;
    authorizedRoles: UserRole[];
  }>;
  loginDemoCompany: () => Promise<{
    user: User;
    profile: UserProfile;
    companyProfile: CompanyProfile | null;
    authorizedRoles: UserRole[];
  }>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateStudentProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateCompanyProfile: (updates: Partial<CompanyProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  requestRoleCorrection: (requestedRole: UserRole, reason: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [authorizedRoles, setAuthorizedRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const isAuthorizedForRole = (targetRole: UserRole): boolean => {
    if (authorizedRoles.includes(targetRole)) return true;
    if (role === targetRole) return true;
    if (userProfile?.role === targetRole) return true;
    if (userProfile?.roles?.includes(targetRole)) return true;
    return false;
  };

  const fetchUserData = async (uid: string, email: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      const emailLower = (email || '').toLowerCase().trim();
      const isAdminEmail =
        emailLower === 'kalikalivino17@gmail.com' ||
        emailLower === 'vinoth1707k@gmail.com';

      // Check if company record exists for this uid
      let fetchedCompany: CompanyProfile | null = null;
      try {
        const compDocRef = doc(db, 'companies', uid);
        const compSnap = await getDoc(compDocRef);
        if (compSnap.exists()) {
          fetchedCompany = compSnap.data() as CompanyProfile;
          setCompanyProfile(fetchedCompany);
        } else {
          setCompanyProfile(null);
        }
      } catch (e) {
        console.warn('Notice checking company record:', e);
      }

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        
        // Build set of all explicitly authorized roles
        const rolesSet = new Set<UserRole>();
        if (data.role) rolesSet.add(data.role);
        if (Array.isArray(data.roles)) {
          data.roles.forEach((r) => rolesSet.add(r));
        }
        if (isAdminEmail) rolesSet.add('admin');
        if (fetchedCompany) rolesSet.add('company');

        const computedRoles = Array.from(rolesSet);
        setAuthorizedRoles(computedRoles);

        // Effective primary role:
        // Admin first -> Company (if company profile exists or role is company) -> Reviewer -> Student
        let effectiveRole: UserRole = data.role || 'student';
        if (isAdminEmail) {
          effectiveRole = 'admin';
        } else if (fetchedCompany || data.role === 'company') {
          effectiveRole = 'company';
        } else if (data.role === 'reviewer') {
          effectiveRole = 'reviewer';
        } else {
          effectiveRole = 'student';
        }

        const updatedProfile = {
          ...data,
          role: effectiveRole,
          roles: computedRoles
        };

        setUserProfile(updatedProfile);
        setRole(effectiveRole);

        return {
          profile: updatedProfile,
          companyProfile: fetchedCompany,
          authorizedRoles: computedRoles
        };
      } else {
        // User doc does not exist yet.
        // Check if account has company record before defaulting to student!
        let initialRole: UserRole = 'student';
        if (isAdminEmail) {
          initialRole = 'admin';
        } else if (fetchedCompany) {
          initialRole = 'company';
        }

        const rolesList: UserRole[] = [initialRole];
        const defaultProfile: UserProfile = {
          uid,
          email: email || '',
          displayName: currentUser?.displayName || (initialRole === 'admin' ? 'Platform Administrator' : initialRole === 'company' ? 'Recruiter' : 'Student Candidate'),
          role: initialRole,
          roles: rolesList,
          bio: 'Verified platform member exploring global career pathways and skill development.',
          educationLevel: 'Undergraduate',
          degree: 'B.Tech in Computer Science',
          institution: 'National University of Technology',
          graduationYear: '2026',
          skills: ['React', 'TypeScript', 'Data Structures', 'Python', 'SQL'],
          softSkills: ['Team Collaboration', 'Problem Solving', 'Communication'],
          projects: [
            {
              id: 'p-initial',
              title: 'Distributed Analytics Pipeline',
              description: 'Real-time telemetry and metrics streaming application.',
              technologies: ['React', 'TypeScript', 'Node.js']
            }
          ],
          certifications: [],
          careerGoals: 'Targeting Associate Full-Stack Software Engineering roles.',
          profileVisibility: 'public',
          profileCompleted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        try {
          await setDoc(userDocRef, defaultProfile);
          setUserProfile(defaultProfile);
          setRole(initialRole);
          setAuthorizedRoles(rolesList);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
        }

        return {
          profile: defaultProfile,
          companyProfile: fetchedCompany,
          authorizedRoles: rolesList
        };
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      throw error;
    }
  };

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      setCurrentUser(user);
      if (user) {
        try {
          await fetchUserData(user.uid, user.email || '');
        } catch (e) {
          console.error('Auth state change data fetch error:', e);
        }
      } else {
        setUserProfile(null);
        setCompanyProfile(null);
        setRole(null);
        setAuthorizedRoles([]);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchUserData(currentUser.uid, currentUser.email || '');
    }
  };

  const registerStudent = async (
    email: string,
    password: string,
    fullName: string,
    additionalDetails?: {
      educationLevel?: string;
      degree?: string;
      institution?: string;
      graduationYear?: string;
      skills?: string[];
      careerInterests?: string[];
      preferredJobRoles?: string[];
      preferredLocations?: string[];
      resumeUrl?: string;
      careerGoals?: string;
    }
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    await updateProfile(user, { displayName: fullName });

    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      role: 'student',
      roles: ['student'],
      displayName: fullName,
      bio: additionalDetails?.careerGoals || 'Enthusiastic candidate developing industry-ready technical skills.',
      educationLevel: additionalDetails?.educationLevel || 'Undergraduate',
      degree: additionalDetails?.degree || 'B.Tech in Computer Science',
      institution: additionalDetails?.institution || 'State University of Technology',
      graduationYear: additionalDetails?.graduationYear || '2026',
      skills: additionalDetails?.skills && additionalDetails.skills.length > 0
        ? additionalDetails.skills
        : ['React', 'TypeScript', 'Data Structures', 'Python'],
      softSkills: ['Critical Thinking', 'Adaptability', 'Teamwork'],
      careerInterests: additionalDetails?.careerInterests || ['Software Engineering', 'Cloud Computing'],
      preferredJobRoles: additionalDetails?.preferredJobRoles || ['Frontend Engineer', 'Full-Stack Developer'],
      preferredLocations: additionalDetails?.preferredLocations || ['Remote', 'Bangalore', 'New York'],
      resumeUrl: additionalDetails?.resumeUrl || '',
      projects: [
        {
          id: 'proj-1',
          title: 'Full-Stack Portfolio App',
          description: 'A responsive personal showcase built with React and Tailwind CSS.',
          technologies: ['React', 'Tailwind CSS', 'TypeScript']
        }
      ],
      certifications: [],
      careerGoals: additionalDetails?.careerGoals || 'Aspiring to join an innovative multinational enterprise.',
      profileVisibility: 'public',
      profileCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setUserProfile(newProfile);
      setRole('student');
      setAuthorizedRoles(['student']);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
    }
  };

  const registerCompany = async (
    workEmail: string,
    password: string,
    recruiterOrDetails:
      | string
      | {
          legalCompanyName: string;
          brandName?: string;
          registrationNumber?: string;
          headquartersAddress?: string;
          operatingLocation?: string;
          website: string;
          recruiterName: string;
          recruiterTitle?: string;
          recruiterPhone?: string;
          companySize?: string;
          industry: string;
          about: string;
          linkedinUrl?: string;
          documentationUrl?: string;
          logoUrl?: string;
          hiringFocus?: string[];
          recruitmentConsent?: boolean;
          antiGhostingPledge?: boolean;
          equalOpportunityAffirmation?: boolean;
          location?: string;
        },
    companyNameParam?: string,
    industryParam: string = 'Technology & Software',
    websiteParam: string = 'https://example.com',
    locationParam: string = 'Global'
  ) => {
    const isObject = typeof recruiterOrDetails === 'object';
    const recruiterName = isObject ? recruiterOrDetails.recruiterName : recruiterOrDetails;
    const companyName = isObject ? (recruiterOrDetails.brandName || recruiterOrDetails.legalCompanyName) : (companyNameParam || 'Enterprise Partner');
    const legalCompanyName = isObject ? recruiterOrDetails.legalCompanyName : companyName;
    const registrationNumber = isObject ? recruiterOrDetails.registrationNumber : '';
    const headquartersAddress = isObject ? recruiterOrDetails.headquartersAddress : '';
    const operatingLocation = isObject ? recruiterOrDetails.operatingLocation : (locationParam || 'Global');
    const recruiterTitle = isObject ? recruiterOrDetails.recruiterTitle : 'Talent Acquisition Partner';
    const recruiterPhone = isObject ? recruiterOrDetails.recruiterPhone : '';
    const companySize = isObject ? recruiterOrDetails.companySize : '500-1000 employees';
    const industry = isObject ? recruiterOrDetails.industry : (industryParam || 'Technology & Software');
    const website = isObject ? recruiterOrDetails.website : (websiteParam || 'https://example.com');
    const about = isObject ? recruiterOrDetails.about : `${companyName} is dedicated to building modern solutions and hiring high-performing graduates and engineers.`;
    const linkedinUrl = isObject ? recruiterOrDetails.linkedinUrl : '';
    const documentationUrl = isObject ? recruiterOrDetails.documentationUrl : '';
    const logoUrl = isObject ? recruiterOrDetails.logoUrl : '';
    const hiringFocus = isObject ? recruiterOrDetails.hiringFocus : ['Full-time', 'Internships'];
    const recruitmentConsent = isObject ? recruiterOrDetails.recruitmentConsent ?? true : true;
    const antiGhostingPledge = isObject ? recruiterOrDetails.antiGhostingPledge ?? true : true;
    const equalOpportunityAffirmation = isObject ? recruiterOrDetails.equalOpportunityAffirmation ?? true : true;
    const location = isObject ? (recruiterOrDetails.location || operatingLocation || headquartersAddress || 'Global') : locationParam;

    const cred = await createUserWithEmailAndPassword(auth, workEmail, password);
    const user = cred.user;

    await updateProfile(user, { displayName: recruiterName });

    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || workEmail,
      role: 'company',
      roles: ['company'],
      displayName: recruiterName,
      headline: `${recruiterTitle} at ${companyName}`,
      profileVisibility: 'private',
      profileCompleted: true,
      skills: [],
      softSkills: [],
      projects: [],
      certifications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newCompany: CompanyProfile = {
      id: user.uid,
      ownerUid: user.uid,
      companyName,
      legalCompanyName,
      brandName: companyName,
      registrationNumber,
      headquartersAddress,
      operatingLocation,
      recruiterName,
      recruiterTitle,
      recruiterPhone,
      workEmail,
      industry,
      companySize,
      website,
      location,
      about,
      linkedinUrl,
      documentationUrl,
      logoUrl,
      hiringFocus,
      recruitmentConsent,
      antiGhostingPledge,
      equalOpportunityAffirmation,
      verificationStatus: 'pending',
      verificationNotes: 'Submitted for administrative accreditation. Review pending.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      await setDoc(doc(db, 'companies', user.uid), newCompany);
      setUserProfile(newProfile);
      setCompanyProfile(newCompany);
      setRole('company');
      setAuthorizedRoles(['company']);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `companies/${user.uid}`);
    }
  };

  const registerReviewer = async (
    email: string,
    password: string,
    fullName: string,
    institution: string
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    await updateProfile(user, { displayName: fullName });

    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      role: 'reviewer',
      roles: ['reviewer'],
      displayName: fullName,
      institution,
      bio: `Independent Interview Fairness Auditor & Academic Evaluation Officer at ${institution}.`,
      profileVisibility: 'private',
      profileCompleted: true,
      skills: ['Assessment Design', 'Interview Fairness', 'Rubric Evaluation'],
      softSkills: ['Objective Analysis', 'Dispute Resolution'],
      projects: [],
      certifications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setUserProfile(newProfile);
      setRole('reviewer');
      setAuthorizedRoles(['reviewer']);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
    }
  };

  const switchDemoRole = (targetRole: UserRole) => {
    setRole(targetRole);
    if (userProfile) {
      setUserProfile({ ...userProfile, role: targetRole });
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const data = await fetchUserData(cred.user.uid, cred.user.email || email);
    return {
      user: cred.user,
      profile: data.profile,
      companyProfile: data.companyProfile,
      authorizedRoles: data.authorizedRoles
    };
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const data = await fetchUserData(cred.user.uid, cred.user.email || '');
    return {
      user: cred.user,
      profile: data.profile,
      companyProfile: data.companyProfile,
      authorizedRoles: data.authorizedRoles
    };
  };

  const loginDemoStudent = async () => {
    const user = await loginAsDemoStudent();
    const data = await fetchUserData(user.uid, user.email || '');
    return {
      user,
      profile: data.profile,
      companyProfile: data.companyProfile,
      authorizedRoles: data.authorizedRoles
    };
  };

  const loginDemoCompany = async () => {
    const user = await loginAsDemoCompany();
    const data = await fetchUserData(user.uid, user.email || '');
    return {
      user,
      profile: data.profile,
      companyProfile: data.companyProfile,
      authorizedRoles: data.authorizedRoles
    };
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
    setCompanyProfile(null);
    setRole(null);
    setAuthorizedRoles([]);
  };

  const requestRoleCorrection = async (requestedRole: UserRole, reason: string) => {
    if (!currentUser) throw new Error('Not authenticated');
    const ticketId = `ticket-${Date.now()}`;
    const ticket = {
      id: ticketId,
      userId: currentUser.uid,
      userEmail: currentUser.email || '',
      userRole: role || 'student',
      category: 'general',
      subject: `Role Access Request: ${requestedRole.toUpperCase()} Portal`,
      description: `User requested authorized access to ${requestedRole} portal. Rationale: ${reason}`,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'supportTickets', ticketId), ticket);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `supportTickets/${ticketId}`);
    }
  };

  const updateStudentProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('Not authenticated');
    const updatePayload = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), updatePayload);
      setUserProfile((prev) => (prev ? { ...prev, ...updatePayload } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const updateCompanyProfile = async (updates: Partial<CompanyProfile>) => {
    if (!currentUser) throw new Error('Not authenticated');
    const safeUpdates = { ...updates };
    delete safeUpdates.verificationStatus;
    delete safeUpdates.ownerUid;
    delete safeUpdates.id;

    const updatePayload = {
      ...safeUpdates,
      updatedAt: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'companies', currentUser.uid), updatePayload);
      setCompanyProfile((prev) => (prev ? { ...prev, ...updatePayload } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `companies/${currentUser.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        companyProfile,
        role,
        authorizedRoles,
        loading,
        isAuthorizedForRole,
        registerStudent,
        registerCompany,
        registerReviewer,
        switchDemoRole,
        loginWithEmail,
        loginWithGoogle,
        loginDemoStudent,
        loginDemoCompany,
        resetPassword,
        logout,
        updateStudentProfile,
        updateCompanyProfile,
        refreshProfile,
        requestRoleCorrection
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
