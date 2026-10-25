import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_COMPETENCY_BLUEPRINTS } from '../../firebase/seedData';
import { QuizAttempt } from '../../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Target,
  Layers,
  Award,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Compass,
  Lightbulb,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SkillGapPage: React.FC = () => {
  const { userProfile, currentUser, updateStudentProfile } = useAuth();
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('frontend-developer');
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  const currentRoleBlueprint = ROLE_COMPETENCY_BLUEPRINTS[selectedRoleKey] || ROLE_COMPETENCY_BLUEPRINTS['frontend-developer'];

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'quizAttempts'),
          where('userId', '==', currentUser.uid)
        );
        const snap = await getDocs(q);
        const list: QuizAttempt[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setAttempts(list);
      } catch (e) {
        console.warn('Could not fetch quiz attempts:', e);
      } finally {
        setLoadingAttempts(false);
      }
    };

    fetchAttempts();
  }, [currentUser]);

  // Aggregate user's declared and assessed skills
  const declaredSkills = userProfile?.skills || [];
  const assessedSkills = Array.from(new Set(attempts.flatMap((a) => a.skillsEvaluated || [])));

  // Identify matching skills and missing gaps
  const requiredSkills = currentRoleBlueprint.requiredSkills;

  const matchedDeclared = requiredSkills.filter((req) =>
    declaredSkills.some((dec) => dec.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(dec.toLowerCase()))
  );

  const matchedAssessed = requiredSkills.filter((req) =>
    assessedSkills.some((ass) => ass.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(ass.toLowerCase()))
  );

  const missingGaps = requiredSkills.filter(
    (req) => !matchedDeclared.includes(req) && !matchedAssessed.includes(req)
  );

  const readinessScore = Math.round(
    ((matchedDeclared.length * 0.4 + matchedAssessed.length * 0.6) / requiredSkills.length) * 100
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200">
              <Target className="w-3.5 h-3.5" />
              <span>Competency Gap &amp; Career Roadmap</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Role Skill-Gap Analysis
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Compare your current competencies against standardized enterprise job requirements. Identify missing knowledge gaps and follow a structured weekly learning plan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/weekly-quiz"
              className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              Take Practice Quiz
            </Link>
          </div>
        </div>

        {/* Target Role Selector Toolbar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Target Career Track:
            </label>
            <p className="text-xs text-slate-500">Benchmark your verified competencies against industry expectations</p>
          </div>

          <select
            value={selectedRoleKey}
            onChange={(e) => setSelectedRoleKey(e.target.value)}
            className="py-2.5 px-4 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="frontend-developer">Frontend Software Engineer</option>
            <option value="backend-developer">Backend &amp; Cloud API Engineer</option>
            <option value="cloud-devops">Cloud Infrastructure &amp; DevOps</option>
            <option value="data-analyst">Data Analyst &amp; BI Specialist</option>
          </select>
        </div>

        {/* Role Overview & Readiness Meter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{currentRoleBlueprint.roleName}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {currentRoleBlueprint.description}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
              <div>
                <span className="font-semibold text-slate-700 block">Total Required Competencies:</span>
                <span className="text-base font-bold text-slate-900">{requiredSkills.length} Core Skills</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700 block">Demonstrated / Assessed:</span>
                <span className="text-base font-bold text-blue-700">{matchedAssessed.length} Assessed Skills</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700 block">Remaining Knowledge Gaps:</span>
                <span className="text-base font-bold text-amber-700">{missingGaps.length} Target Gaps</span>
              </div>
            </div>
          </div>

          {/* Readiness Meter */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block mb-1">
                Role Preparedness Score
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-extrabold">{readinessScore}%</span>
                <span className="text-xs text-slate-400">weighted match</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${readinessScore}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
              *Readiness is weighted 60% on objective assessment evidence and 40% on declared profile projects. Completing roadmaps does not legally guarantee employment.
            </p>
          </div>
        </div>

        {/* 3-Way Comparative Skills Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Assessed Skills */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Assessed Evidence
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified
              </span>
            </div>

            {matchedAssessed.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">
                No quiz assessments completed for this role yet. Take a weekly quiz to verify these skills.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {matchedAssessed.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{sk}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Self-Declared Profile Skills */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Self-Declared Skills
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Profile
              </span>
            </div>

            {matchedDeclared.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">
                None of your profile skills directly match this role's required competencies.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {matchedDeclared.map((sk) => (
                  <span
                    key={sk}
                    className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-medium"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Identified Skill Gaps */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Missing Skill Gaps
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Action Needed
              </span>
            </div>

            {missingGaps.length === 0 ? (
              <p className="text-xs text-emerald-700 font-semibold py-4">
                Congratulations! You have addressed all core competencies required for this role.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {missingGaps.map((sk) => (
                  <span
                    key={sk}
                    className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Personalized 4-Week Structured Roadmap */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Personalized 4-Week Learning Roadmap
              </h3>
              <p className="text-xs text-slate-500">
                Targeted progression to bridge identified gaps for {currentRoleBlueprint.roleName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentRoleBlueprint.learningPath.map((phase) => (
              <div
                key={phase.week}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                    Week {phase.week}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2 leading-snug">
                    {phase.topic}
                  </h4>
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                    {phase.tasks.map((task, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">&bull;</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <Link
                    to="/student/weekly-quiz"
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    Practise Topic &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
