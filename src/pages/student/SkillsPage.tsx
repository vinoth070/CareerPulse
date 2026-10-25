import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { QuizAttempt } from '../../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Layers,
  Award,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Info
} from 'lucide-react';

export const SkillsPage: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttempts = async () => {
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
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };

    loadAttempts();
  }, [currentUser]);

  // Aggregate assessed skills from quiz attempts
  const assessedSkillsMap: Record<string, { totalScore: number; maxScore: number; count: number }> = {};

  attempts.forEach((att) => {
    att.skillsEvaluated?.forEach((skill) => {
      if (!assessedSkillsMap[skill]) {
        assessedSkillsMap[skill] = { totalScore: 0, maxScore: 0, count: 0 };
      }
      assessedSkillsMap[skill].totalScore += att.score;
      assessedSkillsMap[skill].maxScore += att.totalQuestions;
      assessedSkillsMap[skill].count += 1;
    });
  });

  const assessedSkillsList = Object.entries(assessedSkillsMap).map(([skill, stats]) => {
    const percentage = Math.round((stats.totalScore / stats.maxScore) * 100);
    return {
      skill,
      percentage,
      count: stats.count
    };
  });

  const selfDeclaredSkills = userProfile?.skills || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 mb-3">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>Competency &amp; Growth Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Skills &amp; Learning Progress
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
            In compliance with our transparency standards, we clearly separate <strong>Assessed Skills</strong> (verified through objective weekly challenge quizzes) from <strong>Self-Declared Skills</strong> (added via your profile).
          </p>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Ethical Notice:</strong> Weekly quiz outcomes measure ongoing engagement and conceptual retention. They serve as personal skill development evidence and are not formal accreditations or guarantees of workplace competence.
            </span>
          </div>
        </div>

        {/* Two-Column Grid: Assessed vs Self-Declared */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: Assessed Skills */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Assessed Skills (Quiz-Verified)
                </h3>
                <p className="text-xs text-slate-500">Based on evaluated question responses</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                Evidence-Based
              </span>
            </div>

            {loading ? (
              <p className="text-xs text-slate-500 italic py-4">Evaluating assessment records...</p>
            ) : assessedSkillsList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs space-y-3">
                <Award className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No assessed skills yet. Complete your first weekly quiz to generate verified metrics!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assessedSkillsList.map((item) => (
                  <div key={item.skill} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{item.skill}</span>
                      <span className="font-extrabold text-blue-700">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Evaluated in {item.count} assessment challenge{item.count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Self-Declared Skills */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-600" />
                  Self-Declared Skills (Profile)
                </h3>
                <p className="text-xs text-slate-500">Documented by you in your profile</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                Self-Reported
              </span>
            </div>

            {selfDeclaredSkills.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No skills tagged in your profile.</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-2">
                {selfDeclaredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5"
                  >
                    <span>{sk}</span>
                  </span>
                ))}
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
              <span className="font-bold text-slate-800 block">Bridge the Gap:</span>
              <p>
                Recruiters place higher confidence in candidates whose self-declared skills match active quiz assessment records. Check back every week to validate additional competencies.
              </p>
            </div>
          </div>
        </div>

        {/* Targeted Growth Recommendations */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Curated Skill Improvement Recommendations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-[11px] font-bold uppercase text-blue-700">TypeScript &amp; React</span>
              <h4 className="text-xs font-bold text-slate-900">Advanced Generics &amp; Custom Hooks</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Practice building type-safe custom debounce hooks and discriminator union patterns.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-[11px] font-bold uppercase text-indigo-700">Algorithms</span>
              <h4 className="text-xs font-bold text-slate-900">Graph Search &amp; Shortest Paths</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Implement Dijkstra's priority queue and topological sorting for dependency trees.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-[11px] font-bold uppercase text-teal-700">Database &amp; Systems</span>
              <h4 className="text-xs font-bold text-slate-900">ACID Transactions &amp; Indexing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Study composite indexing strategies and atomic lock isolation in distributed storage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
