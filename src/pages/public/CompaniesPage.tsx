import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { INITIAL_DEMO_UPDATES, INITIAL_DEMO_JOBS } from '../../firebase/seedData';
import { CompanyUpdate } from '../../types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Building2,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  Search,
  Filter,
  ShieldCheck,
  Briefcase,
  Megaphone,
  ArrowRight
} from 'lucide-react';

export const CompaniesPage: React.FC = () => {
  const [updates, setUpdates] = useState<CompanyUpdate[]>(INITIAL_DEMO_UPDATES);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const snap = await getDocs(collection(db, 'companyUpdates'));
        const dbList: CompanyUpdate[] = [];
        snap.forEach((d) => {
          dbList.push({ id: d.id, ...(d.data() as any) });
        });

        const merged = [...INITIAL_DEMO_UPDATES];
        dbList.forEach((du) => {
          if (!merged.some((m) => m.id === du.id)) {
            merged.unshift(du);
          }
        });
        setUpdates(merged);
      } catch (e) {
        console.warn('Using initial updates:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  const filteredUpdates = updates.filter((u) => {
    const matchesCategory = selectedCategory === 'all' || u.category === selectedCategory;
    const term = searchKeyword.toLowerCase();
    const matchesSearch =
      u.title.toLowerCase().includes(term) ||
      u.companyName.toLowerCase().includes(term) ||
      u.description.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Enterprise Communications &amp; Hiring Drives</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Company Updates &amp; Recruitment Drives
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Official announcements, internship openings, upcoming interview windows, and technical challenge notices published directly by corporate partner talent teams.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/explore-jobs"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Browse Active Openings
            </Link>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search announcements by company or topic..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Announcement Categories</option>
              <option value="recruitment_drive">Recruitment Drives</option>
              <option value="internship_opening">Internship Openings</option>
              <option value="job_announcement">Job Announcements</option>
              <option value="general_notice">General Notices</option>
            </select>
          </div>
        </div>

        {/* Updates Feed */}
        <div className="space-y-4">
          {filteredUpdates.map((u) => (
            <div
              key={u.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {u.companyName}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    {u.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">
                    Published {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{u.title}</h3>

                <p className="text-xs text-slate-600 leading-relaxed">{u.description}</p>

                <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                  {u.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {u.location}
                    </span>
                  )}
                  {u.deadline && (
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Key Deadline: {u.deadline}
                    </span>
                  )}
                  {u.eligibility && (
                    <span className="text-slate-500">Eligibility: {u.eligibility}</span>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Link
                  to="/explore-jobs"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Explore Openings</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
