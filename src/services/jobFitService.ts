import { JobPosting, UserProfile, JobFitAnalysis } from '../types';

export const DISCLAIMER_TEXT =
  'Your job-fit score is an estimate based on available profile information and the stated job requirements. It is not a hiring decision or a guarantee of selection.';

export function calculateJobFit(job: JobPosting, profile: UserProfile | null): JobFitAnalysis {
  if (!profile) {
    return {
      overallPercentage: 0,
      matchedSkills: [],
      missingSkills: job.requiredSkills || [],
      breakdown: [
        { category: 'Required Skills Match', score: 0, maxScore: 25, details: 'Please sign in or complete profile to assess skill match.' },
        { category: 'Preferred Skills Match', score: 0, maxScore: 10, details: 'Optional/preferred qualifications not evaluated.' },
        { category: 'Assessment Evidence', score: 0, maxScore: 15, details: 'No verified weekly quiz or assessment records found.' },
        { category: 'Project Evidence', score: 0, maxScore: 15, details: 'No verified projects found in portfolio.' },
        { category: 'Experience Level Alignment', score: 0, maxScore: 10, details: 'Experience level not specified.' },
        { category: 'Education & Degree Relevance', score: 0, maxScore: 10, details: 'Degree field not specified.' },
        { category: 'Domain Familiarity', score: 0, maxScore: 5, details: 'Domain context not evaluated.' },
        { category: 'Role Readiness Indicators', score: 0, maxScore: 5, details: 'Platform engagement and readiness not evaluated.' },
        { category: 'Recency of Demonstrated Skills', score: 0, maxScore: 5, details: 'No recent activity recorded.' },
        { category: 'Remaining Gap Areas', score: 0, maxScore: 0, details: 'All required skills currently unverified.' }
      ],
      recommendations: ['Sign in and list your core programming and domain skills.'],
      disclaimer: DISCLAIMER_TEXT
    };
  }

  const userSkillsLower = (profile.skills || []).map(s => s.toLowerCase().trim());
  const reqSkills = job.requiredSkills || [];
  const prefSkills = job.preferredSkills || [];

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  reqSkills.forEach(skill => {
    const isPresent = userSkillsLower.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us));
    if (isPresent) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // 1. Required Skills Match (max 25)
  const reqRatio = reqSkills.length > 0 ? matchedSkills.length / reqSkills.length : 1;
  const reqScore = Math.round(reqRatio * 25);

  // 2. Preferred Skills Match (max 10)
  let prefMatchCount = 0;
  prefSkills.forEach((ps: string) => {
    if (userSkillsLower.some(us => us.includes(ps.toLowerCase()) || ps.toLowerCase().includes(us))) {
      prefMatchCount++;
    }
  });
  const prefRatio = prefSkills.length > 0 ? prefMatchCount / prefSkills.length : 0.5;
  const prefScore = Math.round(prefRatio * 10);

  // 3. Assessment Evidence (max 15)
  // Check verified quiz scores
  const quizHistory = profile.quizHistory || [];
  let assessmentScore = 0;
  if (quizHistory.length >= 3) {
    const avgScore = quizHistory.reduce((acc: number, q: any) => acc + (q.percentage || q.score || 0), 0) / quizHistory.length;
    assessmentScore = Math.min(15, Math.round((avgScore / 100) * 15));
  } else if (quizHistory.length > 0) {
    assessmentScore = 8;
  } else if (profile.verifiedBadges && profile.verifiedBadges.length > 0) {
    assessmentScore = 7;
  } else {
    assessmentScore = 2; // baseline for self-reported
  }

  // 4. Project Evidence (max 15)
  const projects = profile.projects || [];
  let projectScore = 0;
  if (projects.length >= 3) {
    projectScore = 15;
  } else if (projects.length === 2) {
    projectScore = 12;
  } else if (projects.length === 1) {
    projectScore = 8;
  } else {
    projectScore = 2;
  }

  // 5. Experience Level Alignment (max 10)
  let expScore = 6;
  const jobExp = job.experienceLevel || 'entry';
  const gradYearNum = profile.graduationYear ? parseInt(profile.graduationYear, 10) : undefined;
  const currentYear = new Date().getFullYear();
  if (jobExp === 'entry' || jobExp === 'intern' || jobExp === 'graduate') {
    expScore = 10;
  } else if (jobExp === 'mid') {
    expScore = gradYearNum && currentYear - gradYearNum >= 2 ? 10 : 6;
  } else {
    expScore = gradYearNum && currentYear - gradYearNum >= 5 ? 10 : 5;
  }

  // 6. Education Relevance (max 10)
  let eduScore = 5;
  const degree = (profile.degree || '').toLowerCase();
  const major = (profile.major || '').toLowerCase();
  if (degree.includes('computer') || degree.includes('software') || degree.includes('engineering') || major.includes('cs') || major.includes('tech')) {
    eduScore = 10;
  } else if (degree.includes('science') || degree.includes('information') || degree.includes('math') || degree.includes('physics')) {
    eduScore = 8;
  } else if (degree.length > 0) {
    eduScore = 6;
  }

  // 7. Domain Familiarity (max 5)
  let domainScore = 3;
  const domainText = (job.department || job.title || '').toLowerCase();
  if (userSkillsLower.some(s => domainText.includes(s))) {
    domainScore = 5;
  }

  // 8. Role Readiness Indicators (max 5)
  let readinessScore = 2;
  if (profile.bio && profile.headline) readinessScore += 1;
  if (profile.githubUrl || profile.linkedinUrl) readinessScore += 1;
  const experiences = profile.experiences || profile.experience || [];
  if (experiences.length > 0) readinessScore += 1;

  // 9. Recency of Demonstrated Skills (max 5)
  let recencyScore = 3;
  if (quizHistory.length > 0) {
    const latestQuiz: any = quizHistory[quizHistory.length - 1];
    const quizDate = new Date(latestQuiz.submittedAt || latestQuiz.completedAt || Date.now());
    const daysAgo = (Date.now() - quizDate.getTime()) / (1000 * 3600 * 24);

    if (daysAgo < 14) recencyScore = 5;
    else if (daysAgo < 45) recencyScore = 4;
  }

  // Sum total score
  const totalRaw = reqScore + prefScore + assessmentScore + projectScore + expScore + eduScore + domainScore + readinessScore + recencyScore;
  const overallPercentage = Math.min(99, Math.max(10, Math.round(totalRaw)));

  const recommendations: string[] = [];
  if (missingSkills.length > 0) {
    recommendations.push(`Target remaining required skill gaps: ${missingSkills.slice(0, 3).join(', ')}.`);
  }
  if (quizHistory.length < 2) {
    recommendations.push('Complete weekly verified skill quizzes to validate assessment evidence.');
  }
  if (projects.length < 2) {
    recommendations.push('Add verifiable GitHub projects demonstrating applied knowledge.');
  }

  const breakdown = [
    {
      category: '1. Required Skills Match',
      score: reqScore,
      maxScore: 25,
      details: `${matchedSkills.length} of ${reqSkills.length} required competencies verified on profile.`
    },
    {
      category: '2. Preferred Skills Match',
      score: prefScore,
      maxScore: 10,
      details: `${prefMatchCount} of ${prefSkills.length || 'none'} bonus/preferred skills present.`
    },
    {
      category: '3. Assessment Evidence',
      score: assessmentScore,
      maxScore: 15,
      details: quizHistory.length > 0 ? `${quizHistory.length} verified weekly quizzes completed.` : 'Self-reported only; complete weekly quiz to raise score.'
    },
    {
      category: '4. Project Evidence',
      score: projectScore,
      maxScore: 15,
      details: `${projects.length} project portfolio entries attached.`
    },
    {
      category: '5. Experience Alignment',
      score: expScore,
      maxScore: 10,
      details: `Role level is ${job.experienceLevel || 'entry'}. Candidate timeline matches expectations.`
    },
    {
      category: '6. Education Relevance',
      score: eduScore,
      maxScore: 10,
      details: profile.degree ? `${profile.degree} at ${profile.institution || 'Accredited Institution'}` : 'Education field not yet specified.'
    },
    {
      category: '7. Domain Familiarity',
      score: domainScore,
      maxScore: 5,
      details: `Department alignment: ${job.department || 'Technology'}.`
    },
    {
      category: '8. Role Readiness Indicators',
      score: readinessScore,
      maxScore: 5,
      details: `Profile completeness, repository links, and resume availability.`
    },
    {
      category: '9. Recency of Skills',
      score: recencyScore,
      maxScore: 5,
      details: 'Evaluates recent assessment and portfolio update timestamps.'
    },
    {
      category: '10. Remaining Gap Areas',
      score: 0,
      maxScore: 0,
      details: missingSkills.length > 0 ? `Unverified: ${missingSkills.join(', ')}.` : 'No critical skill gaps identified.'
    }
  ];

  return {
    overallPercentage,
    matchedSkills,
    missingSkills,
    breakdown,
    recommendations,
    disclaimer: DISCLAIMER_TEXT
  };
}
