import { Quiz, JobPosting, CompanyUpdate, Hackathon, InterviewRecord, DigitalBadge } from '../types';

export const INITIAL_DEMO_BADGES: DigitalBadge[] = [
  {
    id: 'badge-1',
    title: 'Full-Stack Architecture Specialist',
    description: 'Awarded for scoring 90%+ on the Weekly Assessment in Modern Full-Stack & System Fundamentals.',
    category: 'quiz_excellence',
    tier: 'gold',
    iconName: 'Cpu',
    issuedBy: 'CareerPulse Assessment Board',
    earnedDate: '2026-10-18T10:00:00Z',
    verificationId: 'VER-CP-884920',
    criteria: 'Achieve 90% or higher score on Week 42 System Fundamentals assessment with verified time limit adherence.',
    scoreOrMetric: 'Score: 92% (Top 5% Tier)'
  },
  {
    id: 'badge-2',
    title: 'TypeScript Vanguard',
    description: 'Demonstrated mastery of strict type narrowing, generics, and algebraic types in practical assessments.',
    category: 'core_competency',
    tier: 'silver',
    iconName: 'Code2',
    issuedBy: 'CareerPulse Technical Panel',
    earnedDate: '2026-10-12T14:30:00Z',
    verificationId: 'VER-CP-471092',
    criteria: 'Completed 3 consecutive weekly language assessments with zero type error regressions.',
    scoreOrMetric: 'Mastery Score: 88%'
  },
  {
    id: 'badge-3',
    title: 'CloudScale Innovation Challenge Finalist',
    description: 'Ranked in the top echelon of solutions for the NextGen Real-Time Sync & CRDT challenge.',
    category: 'hackathon_achievement',
    tier: 'gold',
    iconName: 'Trophy',
    issuedBy: 'CloudScale Technologies Enterprise Review Board',
    earnedDate: '2026-10-22T17:00:00Z',
    verificationId: 'VER-CS-991204',
    criteria: 'Delivered an open-source sync engine prototype meeting sub-50ms latency standards under test packet drop.',
    scoreOrMetric: 'Finalist Award • $5,000 Shortlist'
  },
  {
    id: 'badge-4',
    title: 'AWS & Cloud Architecture Certified',
    description: 'Verified professional accreditation in scalable cloud infrastructure and container deployment.',
    category: 'verified_certification',
    tier: 'verified',
    iconName: 'ShieldCheck',
    issuedBy: 'Amazon Web Services (Verified Accredited)',
    earnedDate: '2026-09-15T08:00:00Z',
    verificationId: 'AWS-CERT-9081247',
    criteria: 'Official verification of AWS Certified Solutions Architect Associate credential.',
    scoreOrMetric: 'Credential Validated'
  }
];

export const INITIAL_DEMO_QUIZZES: Quiz[] = [
  {
    id: 'quiz-week-42',
    title: 'Weekly Assessment: Modern Full-Stack & System Fundamentals',
    weekNumber: 42,
    description: 'Test your grasp of modern TypeScript, asynchronous state management, API design, and system scalability.',
    category: 'Software Engineering',
    targetRole: 'Full-Stack Developer',
    timeLimitMinutes: 10,
    totalQuestions: 5,
    status: 'active',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        questionText: 'What is the primary advantage of using immutable state updates in React applications?',
        options: [
          'It directly mutates the DOM without triggering reconciliation',
          'It enables efficient shallow reference equality checks for re-rendering optimizations',
          'It completely eliminates the need for garbage collection in the browser',
          'It compiles JavaScript into native C++ code in memory'
        ],
        correctAnswerIndex: 1,
        explanation: 'React relies on shallow equality comparisons (like in React.memo and hooks dependency arrays). Immutable updates ensure new object references signal state changes predictably.',
        skillTag: 'React & State Architecture'
      },
      {
        id: 'q2',
        questionText: 'In TypeScript, what distinguishes an "unknown" type from an "any" type?',
        options: [
          '"unknown" is identical to "any", just an alias',
          '"unknown" is type-safe: you must narrow or assert its type before performing operations on it',
          '"unknown" can only hold primitive numbers and booleans',
          '"unknown" throws a compile error if assigned a value at runtime'
        ],
        correctAnswerIndex: 1,
        explanation: '"unknown" is the type-safe counterpart of "any". While "any" disables all type-checking, "unknown" forces developers to verify or narrow the type before calling methods or accessing properties.',
        skillTag: 'TypeScript'
      },
      {
        id: 'q3',
        questionText: 'Which HTTP status code is most appropriate when a client request lacks valid authentication credentials?',
        options: [
          '400 Bad Request',
          '401 Unauthorized',
          '403 Forbidden',
          '404 Not Found'
        ],
        correctAnswerIndex: 1,
        explanation: 'HTTP 401 Unauthorized indicates that the client lacks valid authentication credentials. (403 Forbidden indicates the server understands the identity but refuses authorization).',
        skillTag: 'REST APIs & Security'
      },
      {
        id: 'q4',
        questionText: 'What is the time complexity of searching for an element in an average balanced Binary Search Tree (BST)?',
        options: [
          'O(1)',
          'O(log n)',
          'O(n)',
          'O(n log n)'
        ],
        correctAnswerIndex: 1,
        explanation: 'In a balanced BST, each comparison halves the remaining search space, yielding an average time complexity of O(log n).',
        skillTag: 'Algorithms & Data Structures'
      },
      {
        id: 'q5',
        questionText: 'In database engineering, what does the "A" in ACID properties stand for, and what does it guarantee?',
        options: [
          'Availability - The system guarantees 99.999% uptime',
          'Atomicity - All operations in a transaction succeed completely or none take effect',
          'Asynchrony - Writes occur in the background without blocking reads',
          'Authentication - All database queries must be cryptographically signed'
        ],
        correctAnswerIndex: 1,
        explanation: 'Atomicity ensures all-or-nothing execution. If any operation within a transaction fails, the entire transaction is rolled back.',
        skillTag: 'Database Systems'
      }
    ]
  },
  {
    id: 'quiz-week-41',
    title: 'Weekly Assessment: Data Structures & Algorithmic Thinking',
    weekNumber: 41,
    description: 'Core concepts in computational complexity, hash maps, graph traversal, and memory efficiency.',
    category: 'Computer Science Core',
    targetRole: 'Backend Developer',
    timeLimitMinutes: 10,
    totalQuestions: 4,
    status: 'archived',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    questions: [
      {
        id: 'q41_1',
        questionText: 'What collision resolution technique in hash tables chains elements into linked lists at the same bucket index?',
        options: [
          'Linear Probing',
          'Separate Chaining',
          'Double Hashing',
          'Quadratic Probing'
        ],
        correctAnswerIndex: 1,
        explanation: 'Separate Chaining creates a linked list (or balanced tree) at each bucket to hold all key-value pairs that hash to the same index.',
        skillTag: 'Data Structures'
      },
      {
        id: 'q41_2',
        questionText: 'Which algorithm finds the shortest path between nodes in a graph with non-negative edge weights?',
        options: [
          'Depth-First Search',
          'Dijkstra\'s Algorithm',
          'Kruskal\'s Algorithm',
          'Floyd-Warshall'
        ],
        correctAnswerIndex: 1,
        explanation: 'Dijkstra\'s algorithm uses a priority queue to iteratively explore the lowest cumulative distance node in graphs with non-negative weights.',
        skillTag: 'Algorithms'
      },
      {
        id: 'q41_3',
        questionText: 'What is the space complexity of an in-place QuickSort algorithm in the average case?',
        options: [
          'O(1)',
          'O(log n) call stack space',
          'O(n)',
          'O(n^2)'
        ],
        correctAnswerIndex: 1,
        explanation: 'While in-place QuickSort does not allocate new arrays for data, its recursive call stack consumes O(log n) auxiliary space on average.',
        skillTag: 'Algorithms'
      },
      {
        id: 'q41_4',
        questionText: 'Which data structure is primarily used to implement Breadth-First Search (BFS)?',
        options: [
          'Stack (LIFO)',
          'Queue (FIFO)',
          'Max-Heap',
          'Disjoint Set'
        ],
        correctAnswerIndex: 1,
        explanation: 'BFS explores vertices level by level using a First-In-First-Out (FIFO) Queue.',
        skillTag: 'Data Structures'
      }
    ]
  }
];

export const INITIAL_DEMO_JOBS: JobPosting[] = [
  {
    id: 'demo-job-1',
    companyId: 'comp-cloudscale',
    companyName: 'CloudScale Technologies (MNC)',
    title: 'Associate Software Engineer - Frontend & Web Systems',
    description: 'We are seeking passionate graduate engineers and students to join our Enterprise UI platform team. You will build high-performance web applications using React, TypeScript, and modern design systems, collaborating with global distributed teams across APAC and EMEA.',
    requiredSkills: ['React', 'TypeScript', 'CSS/Tailwind', 'REST APIs', 'Git'],
    eligibility: 'Bachelor\'s or Master\'s degree in Computer Science, IT, or related technical field graduating in 2025/2026. Minimum 7.0 CGPA or equivalent.',
    location: 'Bangalore, India',
    country: 'India',
    city: 'Bangalore',
    isHybrid: true,
    experienceLevel: 'graduate',
    employmentType: 'full-time',
    deadline: '2026-11-30',
    status: 'active',
    salaryRange: '$18,000 - $28,000 / yr (Competitive CTC)',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-job-2',
    companyId: 'comp-apex',
    companyName: 'Apex Financial Systems',
    title: 'Software Development Engineering Intern (Summer 2026)',
    description: 'Exciting 6-month internship working on real-time transaction processing, microservices, and reliable cloud pipelines. Mentorship from senior principal architects and clear pathway to full-time placement upon completion.',
    requiredSkills: ['Java', 'Python', 'Data Structures', 'SQL', 'Algorithms'],
    eligibility: 'Pre-final and final year students enrolled in B.E./B.Tech/M.C.A. with proven problem-solving abilities and strong fundamentals.',
    location: 'Singapore',
    country: 'Singapore',
    city: 'Singapore',
    isRemote: true,
    experienceLevel: 'intern',
    employmentType: 'internship',
    deadline: '2026-12-15',
    status: 'active',
    salaryRange: '$2,500 - $3,500 / month stipend',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-job-3',
    companyId: 'comp-nexus',
    companyName: 'Nexus Cloud Infrastructure',
    title: 'Junior Cloud & DevOps Associate',
    description: 'Help manage mission-critical Kubernetes clusters, CI/CD automation pipelines, and infrastructure as code across multi-region cloud environments in Europe and North America.',
    requiredSkills: ['Docker', 'Linux', 'Kubernetes', 'CI/CD', 'Python'],
    eligibility: 'Recent graduates or students in final semester. Certifications in AWS, GCP, or Azure are a strong plus.',
    location: 'Frankfurt, Germany',
    country: 'Germany',
    city: 'Frankfurt',
    isRemote: false,
    experienceLevel: 'entry',
    employmentType: 'full-time',
    deadline: '2026-12-01',
    status: 'active',
    salaryRange: '€55,000 - €68,000 / yr',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-job-4',
    companyId: 'comp-quantum',
    companyName: 'Quantum AI Analytics',
    title: 'Junior Data Analyst & BI Developer',
    description: 'Transform complex enterprise datasets into actionable intelligence dashboards. Collaborate with data science and marketing executives to define critical operational KPI matrices.',
    requiredSkills: ['SQL', 'Python', 'Power BI', 'Statistics', 'Data Modeling'],
    eligibility: 'Graduates in Data Science, Mathematics, Economics, or Computer Applications graduating in 2025/2026.',
    location: 'London, United Kingdom',
    country: 'United Kingdom',
    city: 'London',
    isHybrid: true,
    experienceLevel: 'graduate',
    employmentType: 'full-time',
    deadline: '2026-12-20',
    status: 'active',
    salaryRange: '£38,000 - £46,000 / yr',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-job-5',
    companyId: 'comp-veridian',
    companyName: 'Veridian Cybersecurity Group',
    title: 'Information Security & Compliance Intern',
    description: 'Assist in vulnerability assessments, penetration testing simulation, and SOC alert triage. Gain real hands-on experience under CISSP certified mentors.',
    requiredSkills: ['Network Security', 'Linux', 'Python', 'OWASP Top 10', 'Wireshark'],
    eligibility: 'Penultimate year students in Cybersecurity, Networks, or IT Engineering.',
    location: 'Austin, TX, USA',
    country: 'United States',
    city: 'Austin',
    isRemote: true,
    experienceLevel: 'intern',
    employmentType: 'internship',
    deadline: '2026-11-25',
    status: 'active',
    salaryRange: '$32 - $40 / hour stipend',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export interface DemoCompanyItem {
  id: string;
  name: string;
  companyName?: string;
  industry: string;
  headquarters: string;
  location?: string;
  country: string;
  description: string;
  verified: boolean;
  activeRolesCount: number;
}


export const INITIAL_DEMO_COMPANIES: DemoCompanyItem[] = [
  {
    id: 'comp-cloudscale',
    name: 'CloudScale Technologies',
    industry: 'Enterprise Software & Cloud Platforms',
    headquarters: 'San Francisco, CA & Bangalore',
    country: 'United States',
    description: 'Global enterprise software leader building hyper-scale microservices, distributed messaging infrastructure, and real-time collaboration engines.',
    verified: true,
    activeRolesCount: 3
  },
  {
    id: 'comp-apex',
    name: 'Apex Financial Systems',
    industry: 'Financial Technology & Algorithmic Trading',
    headquarters: 'Singapore (Marina Bay)',
    country: 'Singapore',
    description: 'Tier-1 multinational FinTech institution delivering microsecond-latency trading routers, regulatory audit chains, and quantitative analysis suites.',
    verified: true,
    activeRolesCount: 2
  },
  {
    id: 'comp-nexus',
    name: 'Nexus Cloud Infrastructure',
    industry: 'DevOps & Distributed Cloud Systems',
    headquarters: 'Frankfurt, Germany',
    country: 'Germany',
    description: 'European leader in high-reliability cloud data centers, automated container orchestration, and multi-region zero-downtime mesh networks.',
    verified: true,
    activeRolesCount: 2
  },
  {
    id: 'comp-quantum',
    name: 'Quantum AI Analytics',
    industry: 'Big Data & Machine Intelligence',
    headquarters: 'London, United Kingdom',
    country: 'United Kingdom',
    description: 'Specializes in large-scale data engineering, executive business intelligence reporting, and predictive econometric modeling.',
    verified: false,
    activeRolesCount: 1
  },
  {
    id: 'comp-veridian',
    name: 'Veridian Cybersecurity Group',
    industry: 'Information Security & Compliance',
    headquarters: 'Austin, TX, USA',
    country: 'United States',
    description: 'Next-generation defense solutions, automated vulnerability assessments, and SOC intelligence monitoring for critical infrastructure.',
    verified: true,
    activeRolesCount: 1
  }
];

export const INITIAL_DEMO_UPDATES: CompanyUpdate[] = [
  {
    id: 'update-1',
    companyId: 'comp-cloudscale',
    companyName: 'CloudScale Technologies (MNC)',
    title: '2026 Global Graduate Engineering Recruitment Drive Announced',
    category: 'recruitment_drive',
    description: 'We are officially kicking off our campus and lateral recruitment drive for over 150 frontend and backend associate engineering positions across Bangalore, Singapore, and London offices.',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    eligibility: 'Graduating classes of 2025 and 2026',
    location: 'Global (India, Singapore, UK)',
    deadline: '2026-12-10',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'update-2',
    companyId: 'comp-apex',
    companyName: 'Apex Financial Systems',
    title: 'Summer 2026 FinTech Internship Applications Now Live',
    category: 'internship_opening',
    description: 'Applications are open for 40 paid internship spots in our algorithmic execution and cloud reliability engineering departments. Structured mentorship and competitive monthly stipend provided.',
    requiredSkills: ['Java', 'SQL', 'Algorithms'],
    eligibility: 'Pre-final year university students',
    location: 'Singapore & Remote',
    deadline: '2026-12-15',
    status: 'published',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'update-3',
    companyId: 'comp-nexus',
    companyName: 'Nexus Cloud Infrastructure',
    title: 'Upcoming Virtual Technical Interview Windows Announced',
    category: 'general_notice',
    description: 'Shortlisted candidates for the Junior Cloud Associate role will receive in-platform interview room invitations starting November 10th. Please verify your camera, microphone, and browser environment.',
    deadline: '2026-11-10',
    status: 'published',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_DEMO_HACKATHONS: Hackathon[] = [
  {
    id: 'hack-1',
    companyId: 'comp-cloudscale',
    companyName: 'CloudScale Technologies (MNC)',
    title: 'NextGen Cloud Architecture & Real-Time Sync Hackathon',
    problemStatement: 'Design and prototype a scalable, fault-tolerant collaborative canvas or data sync engine that synchronizes distributed edits in real-time under volatile network conditions (up to 300ms latency) without server crash.',
    description: 'Participants are challenged to build a working prototype with clean state separation, conflict resolution (CRDT or Operational Transformation principles), and responsive UI. Submissions must include working source code, architectural documentation, and live demonstration URL.',
    category: 'Distributed Systems & Web',
    requiredSkills: ['TypeScript', 'WebSockets', 'React', 'Node.js', 'System Architecture'],
    eligibility: 'Open to all registered student and early-career software developers worldwide.',
    teamSizeMax: 4,
    startDate: '2026-10-20',
    deadline: '2026-11-20',
    evaluationCriteria: [
      'Architectural Soundness & Fault Tolerance (25%)',
      'Conflict Resolution Correctness (25%)',
      'User Experience & Responsiveness (20%)',
      'Code Quality & Testing (15%)',
      'Documentation & Demo Completeness (15%)'
    ],
    prizeReward: '$10,000 Grand Prize + Direct Interview Shortlist for Top 5 Teams',
    allowedFormats: ['GitHub Repository', 'Live Demo URL', 'PDF Architecture Dossier'],
    status: 'active',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'hack-2',
    companyId: 'comp-apex',
    companyName: 'Apex Financial Systems',
    title: 'Algorithmic Fraud Anomaly Detection Challenge',
    problemStatement: 'Develop an automated anomaly detection model or rule engine capable of identifying fraudulent multi-party payment rings from high-volume simulated transaction logs with sub-100ms inference time.',
    description: 'Financial fraudsters employ circular credit layering to evade standard threshold triggers. Build a solution that identifies suspicious cyclic graphs and transaction velocity spikes with minimal false positives.',
    category: 'FinTech & Machine Learning',
    requiredSkills: ['Python', 'SQL', 'Algorithms', 'Graph Theory', 'Data Analysis'],
    eligibility: 'Enrolled students and graduates within 2 years of graduation.',
    teamSizeMax: 2,
    startDate: '2026-10-15',
    deadline: '2026-11-30',
    evaluationCriteria: [
      'Detection Accuracy & F1-Score (30%)',
      'Graph Algorithm Execution Efficiency (25%)',
      'Inference Latency Under High Load (20%)',
      'Clarity of Fraud Evidence Report (25%)'
    ],
    prizeReward: '$7,500 Cash Award + SDE Internship Fast-Track',
    allowedFormats: ['Jupyter Notebook / Python Script', 'GitHub Repo', 'Summary Report'],
    status: 'active',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const ROLE_COMPETENCY_BLUEPRINTS: Record<
  string,
  {
    roleName: string;
    requiredSkills: string[];
    description: string;
    learningPath: { week: number; topic: string; tasks: string[] }[];
    interviewQuestions: {
      questionText: string;
      competency: string;
      expectedIndicators: string;
      maxScore: number;
    }[];
  }
> = {
  'frontend-developer': {
    roleName: 'Frontend Software Engineer',
    requiredSkills: ['HTML/CSS', 'JavaScript (ES6+)', 'TypeScript', 'React', 'State Management', 'REST/GraphQL APIs', 'Performance Optimization', 'Git'],
    description: 'Builds responsive, accessible, high-performance user interfaces and web applications using modern component architecture.',
    learningPath: [
      { week: 1, topic: 'Advanced TypeScript & Type Narrowing', tasks: ['Generics and utility types', 'Discriminated unions', 'Type guards'] },
      { week: 2, topic: 'React Hooks Internals & Memory Architecture', tasks: ['useMemo vs useCallback profiling', 'Custom hooks design', 'Reconciliation lifecycle'] },
      { week: 3, topic: 'Web Performance & Core Web Vitals', tasks: ['Code splitting & lazy loading', 'LCP / FID / CLS optimization', 'Bundle size analysis'] },
      { week: 4, topic: 'Testing & Design System Architecture', tasks: ['Component contract testing', 'Tailwind tokens integration', 'Accessibility WCAG AAA'] }
    ],
    interviewQuestions: [
      {
        questionText: 'Explain how React\'s reconciliation algorithm works and why keys are essential in list rendering.',
        competency: 'React Core Architecture',
        expectedIndicators: 'Mentions Virtual DOM diffing, O(n) heuristic, identity persistence, and preventing state leaking between elements.',
        maxScore: 4
      },
      {
        questionText: 'How would you diagnose and resolve an unexpected re-rendering cascade in a large application dashboard?',
        competency: 'Performance Diagnostics',
        expectedIndicators: 'Uses React DevTools profiler, memoization of objects/callbacks, state colocation, and avoiding unnecessary global context triggers.',
        maxScore: 4
      },
      {
        questionText: 'Demonstrate how you handle asynchronous API error states and token expiration gracefully on the client.',
        competency: 'API Integration & Resilience',
        expectedIndicators: 'Mentions error boundaries, Axios/fetch interceptors, token refresh handshake without user interruption, and retry backoff.',
        maxScore: 4
      }
    ]
  },
  'backend-developer': {
    roleName: 'Backend & Cloud API Engineer',
    requiredSkills: ['Node.js/Python/Java', 'REST APIs', 'SQL & Database Indexing', 'Authentication & JWT', 'Caching (Redis)', 'Docker', 'System Scalability', 'Git'],
    description: 'Designs resilient server-side microservices, distributed business logic, relational schemas, and secure API gateways.',
    learningPath: [
      { week: 1, topic: 'Relational Database Schema & Query Indexing', tasks: ['Composite B-Tree indices', 'Execution plan EXPLAIN analysis', 'N+1 query resolution'] },
      { week: 2, topic: 'Distributed Authentication & Authorization (RBAC)', tasks: ['JWT refresh/access token rotation', 'Role-based access rules', 'CSRF/CORS security'] },
      { week: 3, topic: 'Caching & Asynchronous Job Queues', tasks: ['Redis cache invalidation patterns', 'RabbitMQ / BullMQ background tasks', 'Idempotency keys'] },
      { week: 4, topic: 'Containerization & Microservices Health', tasks: ['Docker multi-stage builds', 'Health check probes', 'Graceful shutdown handling'] }
    ],
    interviewQuestions: [
      {
        questionText: 'Describe how you ensure idempotency in a payment or financial transaction API endpoint.',
        competency: 'Distributed System Reliability',
        expectedIndicators: 'Discusses unique idempotency request keys, atomic database unique constraints, cache locking, and consistent response replays.',
        maxScore: 4
      },
      {
        questionText: 'When would you select an optimistic locking strategy over a pessimistic locking strategy in database operations?',
        competency: 'Database Concurrency & ACID',
        expectedIndicators: 'Explains contention frequency: optimistic uses version columns for low conflict; pessimistic locks rows for critical scarce resources.',
        maxScore: 4
      },
      {
        questionText: 'How do you structure rate limiting to defend an open public API against brute-force credential stuffing and DDoS?',
        competency: 'API Security & Protection',
        expectedIndicators: 'Token bucket / leaky bucket algorithms, Redis atomic increments, sliding windows per IP or tenant, and HTTP 429 Retry-After.',
        maxScore: 4
      }
    ]
  },
  'cloud-devops': {
    roleName: 'Cloud Infrastructure & DevOps Engineer',
    requiredSkills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'AWS/GCP/Azure', 'Terraform', 'Monitoring (Prometheus/Grafana)', 'Security'],
    description: 'Automates deployment pipelines, manages multi-cloud clusters, orchestrates containers, and ensures 99.99% service uptime.',
    learningPath: [
      { week: 1, topic: 'Linux Core & Container Internals', tasks: ['Namespaces and cgroups', 'Multi-stage Dockerfiles', 'Non-root container security'] },
      { week: 2, topic: 'Kubernetes Workloads & Networking', tasks: ['Pods, Deployments, Services', 'Ingress controllers and TLS', 'ConfigMaps and Secrets'] },
      { week: 3, topic: 'Infrastructure as Code (IaC) & Terraform', tasks: ['State lock management', 'Reusable Terraform modules', 'Immutable infrastructure'] },
      { week: 4, topic: 'Observability & Incident Management', tasks: ['Prometheus metric scrapers', 'SLI / SLO error budgets', 'Automated rollbacks'] }
    ],
    interviewQuestions: [
      {
        questionText: 'What is the operational difference between a Kubernetes liveness probe and a readiness probe?',
        competency: 'Container Orchestration',
        expectedIndicators: 'Liveness restarts failing containers; readiness removes unready pods from service traffic endpoints without restarting.',
        maxScore: 4
      },
      {
        questionText: 'Explain zero-downtime deployment strategies and compare Rolling Updates with Blue-Green deployments.',
        competency: 'Deployment Automation',
        expectedIndicators: 'Understands traffic routing, instant cutover vs incremental pod substitution, database migration backward-compatibility, and fast rollback.',
        maxScore: 4
      }
    ]
  },
  'data-analyst': {
    roleName: 'Data Analyst & Business Intelligence Specialist',
    requiredSkills: ['Advanced SQL', 'Python (Pandas, NumPy)', 'Data Visualization (Tableau/Power BI)', 'Statistical Modeling', 'ETL Pipelines', 'A/B Testing'],
    description: 'Analyzes enterprise datasets to extract actionable operational metrics, statistical forecasts, and executive performance dashboards.',
    learningPath: [
      { week: 1, topic: 'Complex SQL Window Functions & Aggregations', tasks: ['ROW_NUMBER, RANK, DENSE_RANK', 'LAG and LEAD time offsets', 'Common Table Expressions'] },
      { week: 2, topic: 'Exploratory Data Analysis in Python', tasks: ['Pandas joins and pivots', 'Handling missing and duplicate data', 'Outlier detection'] },
      { week: 3, topic: 'Statistical Hypothesis Testing & A/B Testing', tasks: ['p-values and significance', 'Sample size calculation', 'Type I and Type II errors'] },
      { week: 4, topic: 'Executive Storytelling & BI Design', tasks: ['Interactive dashboards in Power BI', 'Data warehouse star schemas', 'KPI tracking'] }
    ],
    interviewQuestions: [
      {
        questionText: 'Write or describe a SQL query using window functions to find the top 3 highest-spending customers in each region.',
        competency: 'SQL & Data Retrieval',
        expectedIndicators: 'Uses ROW_NUMBER() or DENSE_RANK() OVER (PARTITION BY region ORDER BY total_spend DESC) inside a CTE, then filters where rank <= 3.',
        maxScore: 4
      },
      {
        questionText: 'How do you design and interpret an A/B test when evaluating a newly launched checkout flow conversion rate?',
        competency: 'Statistical Testing & Experimentation',
        expectedIndicators: 'Defines null hypothesis, calculates minimum sample size and test duration to avoid peeking bias, checks statistical significance.',
        maxScore: 4
      }
    ]
  }
};

export const INITIAL_DEMO_INTERVIEWS: InterviewRecord[] = [
  {
    id: 'demo-interview-101',
    applicationId: 'app-demo-1',
    jobId: 'demo-job-1',
    jobTitle: 'Associate Software Engineer - Frontend & Web Systems',
    companyId: 'comp-cloudscale',
    companyName: 'CloudScale Technologies (MNC)',
    candidateUid: 'demo-candidate-1',
    candidateName: 'Candidate (Demo Experience)',
    candidateEmail: 'candidate@careerpulse.internal',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '14:30 UTC',
    stage: 'Technical Round 1',
    status: 'scheduled',
    questions: [
      {
        id: 'iq-1',
        questionText: 'Explain how React\'s reconciliation algorithm works and why keys are essential in list rendering.',
        competency: 'React Core Architecture',
        expectedIndicators: 'Virtual DOM diffing, O(n) heuristic, preventing state leaking across item shifts.',
        maxScore: 4
      },
      {
        id: 'iq-2',
        questionText: 'How would you diagnose and eliminate an unintended re-rendering cascade in a complex dashboard?',
        competency: 'Performance Diagnostics',
        expectedIndicators: 'Profiling with React DevTools, state colocation, memoization with useMemo/useCallback, immutable updates.',
        maxScore: 4
      },
      {
        id: 'iq-3',
        questionText: 'Demonstrate how you structure asynchronous API error states and token expiration gracefully on the client.',
        competency: 'API Integration & Resilience',
        expectedIndicators: 'Error boundaries, interceptor token refresh handshake, toast feedback, and retry backoff.',
        maxScore: 4
      }
    ],
    candidateResponses: {},
    candidateNotes: '',
    rubricScores: {},
    reviewerNotes: '',
    feedbackReleased: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export interface SuggestedPeer {
  uid: string;
  displayName: string;
  headline: string;
  role: 'student' | 'company';
  institutionOrCompany: string;
  institution?: string;
  degree?: string;
  avatarUrl?: string;
  photoUrl?: string;
  mutualCount: number;
  skills: string[];
}


export const INITIAL_DEMO_SUGGESTED_PEOPLE: SuggestedPeer[] = [
  {
    uid: 'peer-1',
    displayName: 'Elena Rostova',
    headline: 'Distributed Systems & Cloud Architecture Senior @ ETH Zürich',
    role: 'student',
    institutionOrCompany: 'ETH Zürich',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    mutualCount: 14,
    skills: ['Go', 'Kubernetes', 'gRPC', 'Distributed Consensus']
  },
  {
    uid: 'peer-2',
    displayName: 'Devon Vance',
    headline: 'Senior University Talent Partner @ CloudScale Technologies',
    role: 'company',
    institutionOrCompany: 'CloudScale Technologies (MNC)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    mutualCount: 8,
    skills: ['Talent Sourcing', 'Engineering Rubrics', 'Graduate Hiring']
  },
  {
    uid: 'peer-3',
    displayName: 'Aarav Sharma',
    headline: 'Undergraduate AI & Algorithms Specialist | Top 5% System Fundamentals',
    role: 'student',
    institutionOrCompany: 'National University of Technology',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    mutualCount: 22,
    skills: ['TypeScript', 'React', 'Data Structures', 'Python']
  },
  {
    uid: 'peer-4',
    displayName: 'Priya Lakshman',
    headline: 'M.S. Computer Engineering @ NUS | FinTech Anomaly Detection Finalist',
    role: 'student',
    institutionOrCompany: 'National University of Singapore',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    mutualCount: 19,
    skills: ['Python', 'SQL', 'Graph Theory', 'Data Modeling']
  },
  {
    uid: 'peer-5',
    displayName: 'Marcus Chen',
    headline: 'Lead Technical Recruiter @ Apex Financial Systems',
    role: 'company',
    institutionOrCompany: 'Apex Financial Systems',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    mutualCount: 6,
    skills: ['FinTech Recruitment', 'HFT Talent', 'Campus Drives']
  }
];

export const INITIAL_DEMO_POSTS = [
  {
    id: 'post-1',
    authorUid: 'peer-1',
    authorName: 'Elena Rostova',
    authorRole: 'student' as const,
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    authorHeadline: 'Distributed Systems & Cloud Architecture Senior @ ETH Zürich',
    content: 'Just completed Week 42 System Fundamentals assessment with a 92% score on CareerPulse! The deep-dive questions on React shallow reference comparisons and B-Tree indexing in PostgreSQL were particularly thought-provoking. For fellow students preparing for MNC system engineering interviews, I highly recommend building hands-on microservice demos rather than just memorizing definitions.',
    mediaUrl: '',
    attachment: {
      title: 'Distributed Analytics Pipeline (GitHub)',
      url: 'https://github.com/example/analytics-pipeline',
      type: 'project'
    },
    likesCount: 38,
    commentsCount: 6,
    sharesCount: 4,
    likedBy: [],
    savedBy: [],
    visibility: 'public' as const,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 'post-2',
    authorUid: 'peer-2',
    authorName: 'Devon Vance',
    authorRole: 'company' as const,
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorHeadline: 'Senior University Talent Partner @ CloudScale Technologies',
    content: 'Recruiter Insight: When evaluating early-career software candidates, our hiring panel looks at verified evidence over resume buzzwords. Candidates with completed Weekly Assessment Badges and runnable GitHub architecture repositories consistently make it to our final technical round 3x faster than average applicants. Keep your skill matrix updated and verify your project evidence!',
    mediaUrl: '',
    likesCount: 84,
    commentsCount: 12,
    sharesCount: 19,
    likedBy: [],
    savedBy: [],
    visibility: 'public' as const,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 3600000).toISOString()
  },
  {
    id: 'post-3',
    authorUid: 'peer-4',
    authorName: 'Priya Lakshman',
    authorRole: 'student' as const,
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    authorHeadline: 'M.S. Computer Engineering @ NUS | FinTech Anomaly Detection Finalist',
    content: 'Excited to announce our team ranked in the Top 5 Finalist tier in the Apex Financial Systems Anomaly Detection Hackathon! We engineered a cyclic graph traversal algorithm that flags suspicious multi-party circular transactions with sub-80ms p99 latency. Grateful for the transparent rubric feedback from the reviewers.',
    mediaUrl: '',
    attachment: {
      title: 'Fraud Anomaly Detection Whitepaper & Code',
      url: 'https://github.com/example/fraud-detection-graph',
      type: 'project'
    },
    likesCount: 61,
    commentsCount: 9,
    sharesCount: 7,
    likedBy: [],
    savedBy: [],
    visibility: 'public' as const,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600000).toISOString()
  }
];

