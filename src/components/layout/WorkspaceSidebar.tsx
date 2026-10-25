import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  User,
  FileText,
  Users,
  Compass,
  MessageSquare,
  Briefcase,
  Building2,
  Sparkles,
  BarChart2,
  Video,
  Award,
  Layers,
  GraduationCap,
  Hash,
  Trophy,
  Calendar,
  Search,
  CheckCircle2,
  Activity,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Moon,
  Sun
} from 'lucide-react';

interface WorkspaceSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const { currentUser, role, authorizedRoles, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isCompany = role === 'company' || authorizedRoles.includes('company');
  const isAdmin = role === 'admin' || authorizedRoles.includes('admin');
  const isStudent = role === 'student' || (!isCompany && !isAdmin);

  const dashboardPath = isCompany
    ? '/company/dashboard'
    : isAdmin
    ? '/admin/dashboard'
    : role === 'reviewer'
    ? '/reviewer/dashboard'
    : '/student/dashboard';

  const profilePath = isCompany ? '/company/settings' : '/student/profile';
  const settingsPath = isCompany ? '/company/settings' : '/student/settings';

  // Navigation Items
  const workspaceItems = [
    { label: 'Dashboard', path: dashboardPath, icon: LayoutDashboard },
    { label: 'My Profile', path: profilePath, icon: User },
    ...(isStudent ? [{ label: 'My Resume', path: '/student/resume-builder', icon: FileText }] : []),
    { label: 'My Network', path: '/network', icon: Users },
    { label: 'Community Feed', path: '/feed', icon: Compass },
    { label: 'Chat', path: '/messages', icon: MessageSquare }
  ];

  const careerItems = [
    { label: 'Jobs & Internships', path: '/explore-jobs', icon: Briefcase },
    { label: 'Companies', path: '/companies', icon: Building2 },
    ...(isStudent
      ? [
          { label: 'Career Roadmap', path: '/student/career-assistant', icon: Sparkles },
          { label: 'Skill Matrix', path: '/student/skill-gap', icon: BarChart2 },
          { label: 'AI Career Assistant', path: '/student/career-assistant', icon: Sparkles },
          { label: 'Interview Preparation', path: '/student/interview-prep', icon: Video },
          { label: 'Assessments', path: '/student/weekly-quiz', icon: Award },
          { label: 'Portfolio', path: '/student/portfolio', icon: Layers },
          { label: 'My Applications', path: '/student/opportunities', icon: CheckCircle2 },
          { label: 'Learning Progress', path: '/student/skills', icon: GraduationCap }
        ]
      : [])
  ];

  const communityItems = [
    { label: 'Posts & Hashtags', path: '/feed', icon: Hash },
    { label: 'Challenges & Hackathons', path: '/hackathons', icon: Trophy },
    { label: 'Events & Certificates', path: isStudent ? '/student/portfolio' : '/companies', icon: Calendar }
  ];

  const recruiterItems = isCompany || isAdmin ? [
    { label: 'Recruiter Dashboard', path: '/company/dashboard', icon: LayoutDashboard },
    { label: 'Company Profile', path: '/company/settings', icon: Building2 },
    { label: 'Talent Search', path: '/company/talent', icon: Search },
    { label: 'Job Management', path: '/company/jobs', icon: Briefcase },
    { label: 'Applications', path: '/company/applications', icon: CheckCircle2 },
    { label: 'Interview Pipeline', path: '/company/interviews', icon: Video },
    { label: 'Hiring Analytics', path: '/company/dashboard', icon: Activity }
  ] : [];

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  const renderNavGroup = (title: string, items: Array<{ label: string; path: string; icon: any }>) => {
    if (items.length === 0) return null;

    return (
      <div className="py-2.5">
        {!collapsed && (
          <div className="px-3.5 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {title}
          </div>
        )}
        <div className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={`${title}-${item.label}-${item.path}`}
                to={item.path}
                onClick={handleLinkClick}
                title={collapsed ? item.label : undefined}
                className={({ isActive: navActive }) => {
                  const active = navActive || isActive;
                  return `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  } ${collapsed ? 'justify-center px-2' : ''}`;
                }}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform ${collapsed ? '' : 'group-hover:scale-105'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 flex flex-col justify-between select-none ${
          collapsed ? 'w-16' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-2 py-3 divide-y divide-slate-100 dark:divide-slate-800/80">
          {renderNavGroup('Workspace', workspaceItems)}
          {renderNavGroup('Career', careerItems)}
          {renderNavGroup('Community', communityItems)}
          {(isCompany || isAdmin) && renderNavGroup('Recruiter Workspace', recruiterItems)}

          {/* Account Group */}
          <div className="py-2.5">
            {!collapsed && (
              <div className="px-3.5 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Account
              </div>
            )}
            <div className="space-y-0.5">
              <NavLink
                to={settingsPath}
                onClick={handleLinkClick}
                title={collapsed ? 'Settings' : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  } ${collapsed ? 'justify-center px-2' : ''}`
                }
              >
                <Settings className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </NavLink>

              <button
                type="button"
                onClick={toggleTheme}
                title={collapsed ? (theme === 'dark' ? 'Light Theme' : 'Dark Theme') : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all ${
                  collapsed ? 'justify-center px-2' : ''
                }`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                {!collapsed && <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>}
              </button>

              <button
                type="button"
                onClick={async () => {
                  await logout();
                  window.location.href = '/login';
                }}
                title={collapsed ? 'Sign Out' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all ${
                  collapsed ? 'justify-center px-2' : ''
                }`}
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Sign Out</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Collapse Toggle (Desktop only) */}
        <div className="p-2 border-t border-slate-100 dark:border-slate-800 hidden lg:flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="truncate">{currentUser ? (currentUser.displayName || currentUser.email) : 'Guest'}</span>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mx-auto lg:mx-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
