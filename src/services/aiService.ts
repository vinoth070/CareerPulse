import { GoogleGenAI } from '@google/genai';
import { UserProfile, JobPosting, CareerTargetPlan } from '../types';

// Role blueprints for high-accuracy rule-based & AI hybrid reasoning
export const TARGET_ROLE_BENCHMARKS: Record<
  string,
  {
    requiredSkills: string[];
    preferredSkills: string[];
    typicalResponsibilities: string[];
    interviewStages: string[];
  }
> = {
  'Software Engineer': {
    requiredSkills: ['Data Structures & Algorithms', 'System Architecture', 'Git', 'Testing & CI/CD', 'SQL'],
    preferredSkills: ['Distributed Systems', 'Docker & Kubernetes', 'GraphQL', 'Cloud (AWS/GCP)'],
    typicalResponsibilities: [
      'Architect, develop, and maintain high-throughput backend services and APIs.',
      'Participate in code reviews, design docs, and production deployment cycles.',
      'Optimize database queries and resolve latency bottlenecks in distributed environments.'
    ],
    interviewStages: ['Coding & Problem Solving Round 1', 'System Architecture Round', 'Engineering Values & Team Fit']
  },
  'Frontend Engineer': {
    requiredSkills: ['React', 'TypeScript', 'HTML5 & Modern CSS', 'State Management', 'Web Performance'],
    preferredSkills: ['Next.js / Vite', 'Tailwind CSS', 'WebSockets', 'Accessibility (a11y)'],
    typicalResponsibilities: [
      'Build responsive, intuitive client interfaces with high rendering fidelity.',
      'Implement state management and real-time streaming updates.',
      'Ensure cross-browser compatibility and maintain web accessibility standards.'
    ],
    interviewStages: ['Live UI Coding Assessment', 'Frontend Architecture & Lifecycle', 'Design Systems & Team Fit']
  },
  'Backend Engineer': {
    requiredSkills: ['Node.js / Go / Java', 'REST & gRPC APIs', 'Relational Databases (PostgreSQL/MySQL)', 'Distributed Caching (Redis)', 'Authentication & Security'],
    preferredSkills: ['Kafka / RabbitMQ', 'Docker & Kubernetes', 'Cloud Run / AWS ECS', 'Microservices'],
    typicalResponsibilities: [
      'Design idempotent REST/gRPC endpoints and secure authorization middleware.',
      'Model relational database schemas and manage transactional integrity.',
      'Ensure horizontal scalability and maintain observability logging.'
    ],
    interviewStages: ['Algorithmic Data Manipulation', 'System Design & Database Modeling', 'Technical Lead Deliberation']
  },
  'Cloud / DevOps Engineer': {
    requiredSkills: ['Docker & Containerization', 'Kubernetes', 'CI/CD Pipelines (GitHub Actions)', 'Linux & Bash', 'Terraform / IaC'],
    preferredSkills: ['Prometheus & Grafana', 'AWS / GCP Solutions', 'Service Mesh (Istio)', 'Zero-Downtime Deployment'],
    typicalResponsibilities: [
      'Maintain automated infrastructure as code (IaC) and deployment pipelines.',
      'Manage multi-region cluster health, failover, and monitoring.',
      'Enforce least-privilege cloud security and container vulnerability scanning.'
    ],
    interviewStages: ['Hands-on Linux & Scripting', 'Infrastructure Architecture & Kubernetes', 'Incident Response & Culture']
  },
  'Data Analyst & BI Specialist': {
    requiredSkills: ['Advanced SQL', 'Python (Pandas, NumPy)', 'Data Visualization (Power BI / Tableau)', 'Statistical Analysis', 'ETL Modeling'],
    preferredSkills: ['BigQuery / Snowflake', 'A/B Testing Methodology', 'Financial Metrics', 'dbt'],
    typicalResponsibilities: [
      'Extract, clean, and model complex transactional datasets for executive reporting.',
      'Construct automated dashboards tracking operational and conversion KPIs.',
      'Design and evaluate A/B testing hypotheses with rigorous statistical confidence.'
    ],
    interviewStages: ['SQL Live Querying & Window Functions', 'Business Case Analysis & Storytelling', 'Stakeholder Communication']
  }
};

// Target company specific cultural & technical hiring emphasis
export const TARGET_COMPANY_PROFILES: Record<
  string,
  {
    cultureTagline: string;
    focusAreas: string[];
    preferredEvidence: string;
  }
> = {
  Google: {
    cultureTagline: 'Engineering excellence at planetary scale, algorithmic rigor, and clean abstraction.',
    focusAreas: ['Algorithmic complexity (Big-O analysis)', 'Scalable distributed architecture', 'Googliness & team collaboration'],
    preferredEvidence: 'Verifiable open-source contributions, high score in algorithmic evaluations, and clean design documentation.'
  },
  Microsoft: {
    cultureTagline: 'Empowering enterprise productivity, cloud scale (Azure), and robust backward compatibility.',
    focusAreas: ['Enterprise systems reliability', 'Cloud & microservices architecture', 'Growth mindset & customer obsession'],
    preferredEvidence: 'Demonstrated experience in typed full-stack development, cloud certifications, and distributed telemetry.'
  },
  Stripe: {
    cultureTagline: 'Exceptional API craftsmanship, developer ergonomics, and microsecond payment reliability.',
    focusAreas: ['API design elegance & idempotency', 'High-availability financial pipelines', 'Rigorous automated testing'],
    preferredEvidence: 'Clean GitHub repositories with comprehensive unit tests and documented architectural trade-offs.'
  },
  CloudScale: {
    cultureTagline: 'Next-generation cloud networking, real-time collaboration engines, and low-latency systems.',
    focusAreas: ['Real-time sync (CRDTs/WebSockets)', 'Cloud orchestration & Kubernetes', 'System observability'],
    preferredEvidence: 'Participation in technical innovation challenges and demonstrated proficiency in modern React + distributed backend.'
  },
  Amazon: {
    cultureTagline: 'Customer obsession, two-pizza team ownership, and high operational excellence.',
    focusAreas: ['Leadership Principles & behavioral evidence', 'AWS cloud architectures', 'Decoupled service ownership'],
    preferredEvidence: 'Quantifiable project outcomes (e.g. "reduced latency by 40%") and modular service design.'
  }
};

/**
 * Generate a comprehensive Target Company Career Plan
 */
export async function generateTargetCareerPlan(params: {
  targetCompany: string;
  targetRole: string;
  location: string;
  userProfile: UserProfile;
  apiKey?: string;
}): Promise<CareerTargetPlan> {
  const { targetCompany, targetRole, location, userProfile, apiKey } = params;

  const benchmark = TARGET_ROLE_BENCHMARKS[targetRole] || TARGET_ROLE_BENCHMARKS['Software Engineer'];
  const companyProfile = TARGET_COMPANY_PROFILES[targetCompany] || {
    cultureTagline: 'Focuses on demonstrable technical competence, clean code standards, and agile collaboration.',
    focusAreas: ['Core problem solving', 'System reliability', 'Collaborative execution'],
    preferredEvidence: 'Verified assessment scores and practical project demonstrations.'
  };

  const userSkills = (userProfile.skills || []).map((s) => s.trim().toLowerCase());
  const demonstratedSet = new Set<string>();

  // Any skill supported by project, quiz, or certification is demonstrated
  (userProfile.projects || []).forEach((p) => {
    (p.technologies || []).forEach((t) => demonstratedSet.add(t.toLowerCase()));
  });
  (userProfile.certifications || []).forEach((c) => {
    demonstratedSet.add(c.title.toLowerCase());
  });

  // Calculate demonstrated vs self-declared vs missing
  const matchedRequired: string[] = [];
  const selfDeclaredOnly: string[] = [];
  const missingSkills: { skill: string; reason: string; priority: 'essential' | 'high' | 'medium' }[] = [];

  benchmark.requiredSkills.forEach((reqSkill) => {
    const isDeclared = userSkills.some((s) => s.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(s));
    const isDemonstrated = Array.from(demonstratedSet).some(
      (d) => d.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(d)
    );

    if (isDemonstrated) {
      matchedRequired.push(reqSkill);
    } else if (isDeclared) {
      selfDeclaredOnly.push(reqSkill);
      missingSkills.push({
        skill: reqSkill,
        reason: `Listed on your profile but lacks supporting project or assessment verification required by ${targetCompany}.`,
        priority: 'high'
      });
    } else {
      missingSkills.push({
        skill: reqSkill,
        reason: `Fundamental requirement for ${targetRole} positions at ${targetCompany}.`,
        priority: 'essential'
      });
    }
  });

  const totalPoints = benchmark.requiredSkills.length * 2;
  const currentPoints = matchedRequired.length * 2 + selfDeclaredOnly.length * 1;
  const matchScore = Math.min(95, Math.max(25, Math.round((currentPoints / totalPoints) * 100)));

  // Try AI enhancement if API key is provided
  let aiCustomSuggestions: string[] = [];
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a Principal Engineering Career Advisor for ${targetCompany}.
Candidate target: ${targetRole} in ${location}.
Candidate current degree: ${userProfile.degree || 'Computer Science'}.
Candidate skills: ${userProfile.skills?.join(', ')}.
Missing skills: ${missingSkills.map((m) => m.skill).join(', ')}.
Provide 3 concise, high-impact resume improvements specifically tailored to get shortlisted at ${targetCompany}. Output ONLY 3 bullet lines, no intro.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      if (response.text) {
        aiCustomSuggestions = response.text
          .split('\n')
          .map((line) => line.replace(/^[-*•0-9.]+\s*/, '').trim())
          .filter(Boolean)
          .slice(0, 3);
      }
    } catch (e) {
      console.warn('AI call fallback to structured rules:', e);
    }
  }

  const resumeSuggestions = [
    {
      category: 'missing_evidence' as const,
      suggestion:
        aiCustomSuggestions[0] ||
        `Quantify project achievements with business impact (e.g. "Reduced API p99 latency from 180ms to 42ms" rather than generic descriptions) to match ${targetCompany}'s engineering rubric.`
    },
    {
      category: 'structural' as const,
      suggestion:
        aiCustomSuggestions[1] ||
        `Highlight competencies in ${missingSkills.slice(0, 2).map((m) => m.skill).join(' & ') || 'System Design'} near the top of your technical skills section.`
    },
    {
      category: 'impact_metric' as const,
      suggestion:
        aiCustomSuggestions[2] ||
        `Include direct GitHub or live deployment links for full-stack projects; ${targetCompany} recruiters prioritize runnable code over bullet points.`
    }
  ];

  const weeklyPlan = [
    {
      week: 1,
      title: 'Target Skill Foundations & Diagnostic',
      description: `Bridge primary gaps in ${missingSkills[0]?.skill || 'Core Data Structures'} with focused review.`,
      tasks: [
        { id: 't1-1', label: `Complete the CareerPulse Weekly Assessment for ${targetRole}`, completed: false, type: 'quiz' as const },
        { id: 't1-2', label: `Review documentation on ${missingSkills[0]?.skill || 'Architectural Patterns'}`, completed: false, type: 'reading' as const },
        { id: 't1-3', label: `Format your education and degree details to align with ${targetCompany} criteria`, completed: true, type: 'resume' as const }
      ]
    },
    {
      week: 2,
      title: 'Practical Project Implementation',
      description: `Build an authentic demonstration project addressing ${companyProfile.focusAreas[0] || 'System Architecture'}.`,
      tasks: [
        { id: 't2-1', label: `Implement a modular service demonstrating ${missingSkills[1]?.skill || 'API Integration'}`, completed: false, type: 'project' as const },
        { id: 't2-2', label: 'Write unit tests ensuring code coverage exceeds 80%', completed: false, type: 'project' as const },
        { id: 't2-3', label: 'Push solution to GitHub with a clean architectural README', completed: false, type: 'resume' as const }
      ]
    },
    {
      week: 3,
      title: 'Company Challenges & Assessment',
      description: `Participate in active Company Challenges to earn verified portfolio badges.`,
      tasks: [
        { id: 't3-1', label: 'Submit a proposal to an active Innovation Challenge', completed: false, type: 'project' as const },
        { id: 't3-2', label: 'Upload your verified course or industry credential to Portfolio', completed: false, type: 'resume' as const }
      ]
    },
    {
      week: 4,
      title: 'Interview Preparation & Application Readiness',
      description: `Practice in the Online Interview Room and submit your verified application.`,
      tasks: [
        { id: 't4-1', label: `Review 0–4 competency rubrics for ${targetRole} stages`, completed: false, type: 'reading' as const },
        { id: 't4-2', label: 'Run a mock interview test in the Online Interview Room', completed: false, type: 'quiz' as const },
        { id: 't4-3', label: `Submit application for ${targetRole} via Global Job Discovery`, completed: false, type: 'resume' as const }
      ]
    }
  ];

  return {
    id: `plan-${Date.now()}`,
    userId: userProfile.uid,
    targetCompany,
    targetRole,
    location,
    analyzedAt: new Date().toISOString(),
    matchScore,
    demonstratedSkills: matchedRequired,
    selfDeclaredSkills: selfDeclaredOnly,
    missingSkills,
    weeklyPlan,
    resumeSuggestions
  };
}

/**
 * AI-assisted Job Description & Rubric generator for recruiters
 */
export async function generateJobDescriptionDraft(params: {
  title: string;
  department: string;
  experienceLevel: string;
  requiredSkills: string[];
  apiKey?: string;
}): Promise<{
  description: string;
  responsibilities: string[];
  suggestedRubric: { question: string; competency: string; expectedIndicators: string }[];
}> {
  const { title, department, experienceLevel, requiredSkills, apiKey } = params;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Write an enterprise job posting and 2 rubric interview questions for:
Role: ${title}
Department: ${department}
Level: ${experienceLevel}
Skills: ${requiredSkills.join(', ')}

Return a clean JSON object with:
{
  "description": "Short professional 2-sentence summary",
  "responsibilities": ["3 distinct bullet points"],
  "suggestedRubric": [
    { "question": "Technical question", "competency": "Domain", "expectedIndicators": "What 4/4 looks like" }
  ]
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });
      if (response.text) {
        const cleaned = response.text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return parsed;
      }
    } catch (e) {
      console.warn('AI job drafter fallback:', e);
    }
  }

  // Robust rule-based default
  return {
    description: `We are seeking a talented ${title} to join our ${department} team. In this role, you will architect resilient systems, collaborate with cross-functional partners, and deliver high-impact software solutions.`,
    responsibilities: [
      `Design, build, and maintain production-grade features using ${requiredSkills.slice(0, 3).join(', ') || 'modern industry standards'}.`,
      'Participate actively in architectural reviews, automated test suite maintenance, and team knowledge sharing.',
      'Diagnose and address system bottlenecks to ensure high availability and responsiveness.'
    ],
    suggestedRubric: [
      {
        question: `Describe a challenging scenario where you engineered a solution using ${requiredSkills[0] || 'core technologies'}. How did you measure success?`,
        competency: 'Technical Execution & Architecture',
        expectedIndicators: 'Mentions measurable performance metrics, handling failure modes, and clear architectural trade-offs.'
      },
      {
        question: 'How do you structure code to balance rapid delivery with long-term maintainability and automated testability?',
        competency: 'Engineering Discipline & Quality',
        expectedIndicators: 'Discusses modularity, dependency inversion, clean separation of concerns, and regression testing.'
      }
    ]
  };
}
