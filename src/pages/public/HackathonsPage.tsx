import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { INITIAL_DEMO_HACKATHONS } from '../../firebase/seedData';
import { Hackathon } from '../../types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Code2,
  Calendar,
  Users,
  Award,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  X
} from 'lucide-react';

export const HackathonsPage: React.FC = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>(INITIAL_DEMO_HACKATHONS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const snap = await getDocs(collection(db, 'hackathons'));
        const dbList: Hackathon[] = [];
        snap.forEach((d) => {
          dbList.push({ id: d.id, ...(d.data() as any) });
        });

        const merged = [...INITIAL_DEMO_HACKATHONS];
        dbList.forEach((dh) => {
          if (!merged.some((m) => m.id === dh.id)) {
            merged.unshift(dh);
          }
        });
        setHackathons(merged);
      } catch (e) {
        console.warn('Using initial hackathons:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();
  }, []);

  const filteredHackathons = hackathons.filter((h) => {
    const term = searchTerm.toLowerCase();
    return (
      h.title.toLowerCase().includes(term) ||
      h.companyName.toLowerCase().includes(term) ||
      h.category.toLowerCase().includes(term) ||
      h.requiredSkills.some((s) => s.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200">
              <Code2 className="w-3.5 h-3.5" />
              <span>Enterprise Problem Statements &amp; Challenges</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Company Innovation Challenges &amp; Technical Competitions
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Tackle authentic engineering problem statements published by top employers. Submit working prototypes, earn verifiable digital credentials, and fast-track to direct interviews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/hackathons"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              My Registered Submissions
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by challenge title, company, or domain (e.g. Distributed Systems, FinTech, Python)..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Hackathon Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredHackathons.map((h) => (
            <div
              key={h.id}
              className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                    {h.companyName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {h.isDemo && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        DEMO
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {h.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {h.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {h.problemStatement}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Deadline: {h.deadline}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Max Team: {h.teamSizeMax} Members</span>
                  </div>
                </div>

                {h.prizeReward && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{h.prizeReward}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {h.requiredSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedHackathon(h)}
                  className="w-full py-2.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
                >
                  View Problem &amp; Rubric
                </button>
                <Link
                  to="/student/hackathons"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shrink-0 text-center"
                >
                  Submit Solution
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Problem Detail Modal */}
        {selectedHackathon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                    {selectedHackathon.companyName} Challenge
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{selectedHackathon.title}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedHackathon.category} &bull; Deadline: {selectedHackathon.deadline}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedHackathon(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Full Problem Statement
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {selectedHackathon.problemStatement}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Detailed Implementation Brief
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedHackathon.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pre-Published Evaluation Rubric
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedHackathon.evaluationCriteria.map((crit, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Allowed: {selectedHackathon.allowedFormats?.join(', ') || 'GitHub Repository, Demo URL'}
                </div>
                <Link
                  to="/student/hackathons"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Submit Solution in Portal
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
