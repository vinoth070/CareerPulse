import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { searchGlobal, sendConnectionRequest } from '../../services/networkingService';
import { calculateJobFit } from '../../services/jobFitService';
import { UserProfile, CompanyProfile, JobPosting, FeedPost, JobFitAnalysis } from '../../types';
import {
  Search,
  Users,
  Building2,
  Briefcase,
  FileText,
  UserPlus,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Heart,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialTab = searchParams.get('tab') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'companies' | 'jobs' | 'posts'>(
    initialTab as any
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    people: UserProfile[];
    companies: CompanyProfile[];
    jobs: JobPosting[];
    posts: FeedPost[];
  }>({
    people: [],
    companies: [],
    jobs: [],
    posts: []
  });

  const [connectNotice, setConnectNotice] = useState<string | null>(null);

  // Job Fit Modal
  const [selectedJobFit, setSelectedJobFit] = useState<{
    job: JobPosting;
    fit: JobFitAnalysis;
  } | null>(null);

  const executeSearch = async (searchTerm: string) => {
    setLoading(true);
    try {
      const res = await searchGlobal(searchTerm);
      setResults(res);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(query);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query, tab: activeTab });
    executeSearch(query);
  };

  const handleConnect = async (target: UserProfile) => {
    if (!currentUser) return;
    try {
      await sendConnectionRequest(
        currentUser.uid,
        userProfile?.displayName || currentUser.email || 'Professional',
        userProfile?.headline || userProfile?.degree || '',
        userProfile?.photoUrl,
        target.uid,
        target.displayName || 'Member',
        target.headline || target.degree || '',
        target.photoUrl
      );
      setConnectNotice(`Connection request sent to ${target.displayName || 'member'}!`);
      setTimeout(() => setConnectNotice(null), 3500);
    } catch (e: any) {
      setConnectNotice(e.message || 'Error sending connection request');
      setTimeout(() => setConnectNotice(null), 3500);
    }
  };

  const handleEvaluateFit = (job: JobPosting) => {
    const fit = calculateJobFit(job, userProfile);
    setSelectedJobFit({ job, fit });
  };

  const totalResults =
    results.people.length +
    results.companies.length +
    results.jobs.length +
    results.posts.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      {/* Top Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search people by skills, university, jobs, MNC companies, posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm text-white bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl transition-all shadow-xs"
          >
            <Search className="w-4 h-4" />
            Search Platform
          </button>
        </form>

        {connectNotice && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{connectNotice}</span>
          </div>
        )}

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Results ({totalResults})
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'people'
                ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            People ({results.people.length})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'companies'
                ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Companies ({results.companies.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'jobs'
                ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Jobs ({results.jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'posts'
                ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Feed Posts ({results.posts.length})
          </button>
        </div>
      </div>

      {/* Results Container */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400">
          <div className="w-8 h-8 border-4 border-blue-900 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold">Searching platform directory...</p>
        </div>
      ) : totalResults === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
          <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No matches found for "{query}"</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Try searching for broader keywords such as 'Full Stack', 'Cloud', 'Google', 'Python', or clear your search to explore all members.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* People Section */}
          {(activeTab === 'all' || activeTab === 'people') && results.people.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  People ({results.people.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.people.map((person) => (
                  <div
                    key={person.uid}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0">
                        {person.displayName ? person.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {person.displayName}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {person.headline || person.degree || 'Professional Member'}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{person.institution}</p>
                      </div>
                    </div>

                    {person.skills && person.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {person.skills.slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => handleConnect(person)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Connect
                      </button>
                      <Link
                        to="/messages"
                        className="p-1.5 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition-colors"
                        title="Send Message"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Companies Section */}
          {(activeTab === 'all' || activeTab === 'companies') && results.companies.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  Companies ({results.companies.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.companies.map((comp) => (
                  <div
                    key={comp.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-extrabold flex items-center justify-center text-lg">
                          {comp.companyName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            {comp.companyName}
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{comp.industry || 'Technology'}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{comp.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400 dark:text-slate-500">{comp.location || 'Global'}</span>
                      <Link
                        to={`/company-page/${comp.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900"
                      >
                        View Profile &amp; Jobs <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Jobs Section */}
          {(activeTab === 'all' || activeTab === 'jobs') && results.jobs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  Jobs &amp; Opportunities ({results.jobs.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.jobs.map((job) => {
                  const fit = calculateJobFit(job, userProfile);
                  return (
                    <div
                      key={job.id}
                      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{job.title}</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{job.companyName}</p>
                          </div>
                          {/* Fit Score Badge */}
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              {fit.overallPercentage}% Match
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {job.employmentType}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{job.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleEvaluateFit(job)}
                          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline underline-offset-2"
                        >
                          View 10-Point Fit Breakdown
                        </button>
                        <Link
                          to={`/explore-jobs`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl transition-colors"
                        >
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Posts Section */}
          {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  Feed Posts ({results.posts.length})
                </h2>
              </div>
              <div className="space-y-4">
                {results.posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-600 text-white font-bold flex items-center justify-center">
                        {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{post.authorName}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{post.authorHeadline}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500" /> {post.likesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {post.commentsCount}
                      </span>
                      <Link
                        to="/feed"
                        className="ml-auto text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900"
                      >
                        Join Discussion in Feed &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 10-Point Job-Fit Modal */}
      {selectedJobFit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                  Transparent Job-Fit Evaluation
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {selectedJobFit.job.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">{selectedJobFit.job.companyName}</p>
              </div>
              <button
                onClick={() => setSelectedJobFit(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mandatory Disclaimer Box */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs leading-relaxed mb-6 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Transparent Disclosure: </span>
                {selectedJobFit.fit.disclaimer}
              </div>
            </div>

            {/* Overall Score */}
            <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">
                  Estimated Requirement Alignment
                </p>
                <h4 className="text-2xl font-black text-white">
                  {selectedJobFit.fit.overallPercentage}% Match
                </h4>
              </div>
              <div className="text-right text-xs text-slate-300">
                <p>
                  Matched Skills: <span className="font-bold text-white">{selectedJobFit.fit.matchedSkills?.length || 0}</span>
                </p>
                <p>
                  Gaps: <span className="font-bold text-amber-400">{selectedJobFit.fit.missingSkills?.length || 0}</span>
                </p>
              </div>
            </div>

            {/* 10-Point Category Breakdown */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              10-Point Factor Breakdown
            </h4>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {selectedJobFit.fit.breakdown?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{item.category}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.details}</p>
                  </div>
                  {item.maxScore > 0 && (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shrink-0 self-start sm:self-center">
                      {item.score} / {item.maxScore} pts
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedJobFit(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Close
              </button>
              <Link
                to="/explore-jobs"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl transition-all shadow-xs"
              >
                Proceed to Submit Application <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
