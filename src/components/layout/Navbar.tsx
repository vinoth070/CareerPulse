import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BRAND_CONFIG } from '../../config/brand';
import {
  Briefcase,
  Compass,
  GraduationCap,
  Building2,
  Award,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Clock,
  Sparkles,
  Scale,
  Lock,
  Code2,
  FileText,
  Video,
  Bell,
  Users,
  MessageSquare,
  Search,
  Share2,
  Check
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { AppNotification } from '../../types';
import { NotificationCenter } from '../common/NotificationCenter';
import { DemoBanner } from '../common/DemoBanner';

export const Navbar: React.FC = () => {
  const { currentUser, userProfile, companyProfile, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);

  useEffect(() => {
    if (!currentUser) {
      setUnreadNotifsCount(0);
      return;
    }
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientUid', '==', currentUser.uid)
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          let count = 0;
          snapshot.forEach((d) => {
            const data = d.data();
            if (!data.read) count++;
          });
          setUnreadNotifsCount(count);
        },
        (err) => {
          console.warn('Navbar notification count error:', err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Navbar listener setup error:', e);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const isActive = (path: string) => location.pathname === path;


  return (
    <>
      <DemoBanner />
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo & Global Nav */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-900 transition-colors">
                <Briefcase className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  {BRAND_CONFIG.name}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 rounded-full border border-blue-200">
                  Platform
                </span>
              </div>
            </Link>

            {/* Public Global Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/explore-jobs"
                className={`px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors ${
                  isActive('/explore-jobs') ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Jobs &amp; Internships
              </Link>
              <Link
                to="/hackathons"
                className={`px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors ${
                  isActive('/hackathons') ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Company Challenges
              </Link>
              <Link
                to="/companies"
                className={`px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors ${
                  isActive('/companies') ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Companies &amp; Feed
              </Link>
            </div>
          </div>

          {/* Center: Portal Specific Links */}
          <div className="hidden xl:flex items-center space-x-1">
            {/* Student Navigation Links */}
            {currentUser && role === 'student' && (
              <>
                <Link
                  to="/student/dashboard"
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                    isActive('/student/dashboard') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/student/career-assistant"
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 ${
                    isActive('/student/career-assistant')
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-blue-700 hover:bg-blue-50/50'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  Career Assistant
                </Link>
                <Link
                  to="/student/skill-gap"
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                    isActive('/student/skill-gap') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Skill Matrix
                </Link>
                <Link
                  to="/student/resume-builder"
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                    isActive('/student/resume-builder') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Resume Builder
                </Link>
                <Link
                  to="/student/weekly-quiz"
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                    isActive('/student/weekly-quiz') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Assessments
                </Link>
                <Link
                  to="/student/portfolio"
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                    isActive('/student/portfolio') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Portfolio &amp; Badges
                </Link>
                <Link
                  to="/student/opportunities"
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                    isActive('/student/opportunities') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  My Applications
                </Link>
              </>
            )}

            {/* Company / Recruiter Navigation Links */}
            {currentUser && role === 'company' && (
              <>
                <Link
                  to="/company/dashboard"
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                    isActive('/company/dashboard') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/company/jobs"
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                    isActive('/company/jobs') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Manage Jobs
                </Link>
                <Link
                  to="/company/talent"
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                    isActive('/company/talent') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Talent Search
                </Link>
                <Link
                  to="/company/interviews"
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                    isActive('/company/interviews') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Interviews &amp; Rubrics
                </Link>
                <Link
                  to="/company/hackathons"
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                    isActive('/company/hackathons') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Challenges
                </Link>
                <Link
                  to="/company/updates"
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                    isActive('/company/updates') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Announcements
                </Link>
              </>
            )}

            {/* Admin Navigation */}
            {currentUser && role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-800 rounded-lg border border-rose-200 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                Admin Governance Portal
              </Link>
            )}

            {/* Reviewer Navigation */}
            {currentUser && role === 'reviewer' && (
              <Link
                to="/reviewer/dashboard"
                className="px-3 py-1.5 text-xs font-bold bg-teal-50 text-teal-800 rounded-lg border border-teal-200 flex items-center gap-1.5"
              >
                <Scale className="w-3.5 h-3.5 text-teal-600" />
                Fairness Reviewer Portal
              </Link>
            )}
          </div>

          {/* Right Section: User Menu or Auth CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            {!currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login?portal=company"
                  className="px-3 py-2 text-xs lg:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden lg:inline">For Employers</span>
                  <span className="lg:hidden">Recruiters</span>
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs lg:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-xs lg:text-sm font-bold text-white bg-slate-900 hover:bg-blue-900 rounded-lg shadow-xs transition-all"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Networking Icon Links */}
                <Link
                  to="/feed"
                  title="Professional Feed"
                  className={`p-2 rounded-xl transition-colors ${
                    isActive('/feed') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                </Link>
                <Link
                  to="/network"
                  title="My Network"
                  className={`p-2 rounded-xl transition-colors ${
                    isActive('/network') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                </Link>
                <Link
                  to="/messages"
                  title="Messages"
                  className={`p-2 rounded-xl transition-colors relative ${
                    isActive('/messages') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>
                <Link
                  to="/search"
                  title="Search Platform"
                  className={`p-2 rounded-xl transition-colors ${
                    isActive('/search') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Search className="w-4 h-4" />
                </Link>

                {/* Centralized NotificationCenter */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className={`p-2 rounded-xl transition-colors relative ${
                      notificationsOpen ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifsCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  <NotificationCenter
                    isOpen={notificationsOpen}
                    onClose={() => setNotificationsOpen(false)}
                  />
                </div>

                {/* Profile Dropdown */}
                <div className="relative">

                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                      {userProfile?.displayName || currentUser.email}
                    </p>
                    <span className="text-[10px] text-slate-500 capitalize font-medium">
                      {role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 divide-y divide-slate-100"
                  >
                    <div className="px-4 py-2.5">
                      <p className="text-[11px] text-slate-400 uppercase font-semibold">Account</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {role}
                      </span>
                    </div>

                    <div className="py-1 text-xs">
                      {role === 'student' && (
                        <>
                          <Link
                            to="/student/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            My Profile &amp; Badges
                          </Link>
                          <Link
                            to="/student/settings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                            Settings &amp; Privacy
                          </Link>
                        </>
                      )}
                      {role === 'company' && (
                        <Link
                          to="/company/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                        >
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          Company Settings
                        </Link>
                      )}
                      {role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-rose-700 hover:bg-rose-50"
                        >
                          <Lock className="w-3.5 h-3.5 text-rose-500" />
                          Super Admin Portal
                        </Link>
                      )}
                      {role === 'reviewer' && (
                        <Link
                          to="/reviewer/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-teal-700 hover:bg-teal-50"
                        >
                          <Scale className="w-3.5 h-3.5 text-teal-500" />
                          Fairness Reviewer Portal
                        </Link>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>


          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`p-2 rounded-lg transition-colors relative ${
                    notificationsOpen ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-white animate-pulse" />
                  )}
                </button>
                <NotificationCenter
                  isOpen={notificationsOpen}
                  onClose={() => setNotificationsOpen(false)}
                />
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            <Link
              to="/explore-jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Jobs &amp; Internships
            </Link>
            <Link
              to="/hackathons"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Company Challenges
            </Link>
            <Link
              to="/companies"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Companies &amp; Feed
            </Link>
          </div>

          {currentUser && role === 'student' && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3">
                Candidate Workspace
              </span>
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <Link
                to="/student/career-assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-lg text-sm font-bold text-blue-700 hover:bg-blue-50"
              >
                Target Career Assistant
              </Link>
              <Link
                to="/student/skill-gap"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Skill Gap Matrix
              </Link>
              <Link
                to="/student/resume-builder"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Resume Builder
              </Link>
              <Link
                to="/student/portfolio"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Portfolio &amp; Badges
              </Link>
              <Link
                to="/student/opportunities"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                My Applications
              </Link>
            </div>
          )}

          {currentUser && role === 'company' && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3">
                Recruiter Portal
              </span>
              <Link
                to="/company/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Company Dashboard
              </Link>
              <Link
                to="/company/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Manage Job Vacancies
              </Link>
              <Link
                to="/company/talent"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Candidate Search &amp; Matching
              </Link>
              <Link
                to="/company/interviews"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Interviews &amp; Rubrics
              </Link>
              <Link
                to="/company/hackathons"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Company Challenges
              </Link>
              <Link
                to="/company/updates"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Corporate Announcements
              </Link>
            </div>
          )}

          {currentUser && role === 'admin' && (
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-bold text-rose-700 bg-rose-50"
              >
                Admin Governance Portal
              </Link>
            </div>
          )}

          {currentUser && role === 'reviewer' && (
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/reviewer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-bold text-teal-700 bg-teal-50"
              >
                Fairness Reviewer Portal
              </Link>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                Log Out
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-slate-900 rounded-lg"
                >
                  Register Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
    </>
  );
};
