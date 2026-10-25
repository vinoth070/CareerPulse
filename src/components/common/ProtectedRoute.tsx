import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, LogOut, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole | UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { currentUser, role, authorizedRoles, isAuthorizedForRole, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Authenticating secure session...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole) {
    const isAllowed = Array.isArray(allowedRole)
      ? allowedRole.some((r) => isAuthorizedForRole ? isAuthorizedForRole(r) : r === role)
      : (isAuthorizedForRole ? isAuthorizedForRole(allowedRole) : role === allowedRole);

    if (!isAllowed) {
      const allowedText = Array.isArray(allowedRole)
        ? allowedRole.join(' or ')
        : allowedRole;

      const myDashboard =
        role === 'company'
          ? '/company/dashboard'
          : role === 'admin'
          ? '/admin/dashboard'
          : role === 'reviewer'
          ? '/reviewer/dashboard'
          : '/student/dashboard';

      return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-md p-8 text-center space-y-6">
            <div className="w-14 h-14 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Unauthorized Portal Access
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Access Restricted to {allowedText.toUpperCase()} Portal
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your authenticated account (<span className="font-semibold text-slate-800">{currentUser.email}</span>) is registered as{' '}
                <span className="font-bold text-slate-900 capitalize">[{role || 'unassigned'}]</span>. You do not have verified authorization for this workspace.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Role:</span>
                <span className="font-bold text-slate-900 capitalize">{role || 'Student'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Authorized Roles:</span>
                <span className="font-semibold text-blue-700">
                  {authorizedRoles.length > 0 ? authorizedRoles.join(', ') : role || 'student'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Requested Route:</span>
                <span className="font-mono text-[11px] text-slate-700 truncate max-w-[200px]">{location.pathname}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                to={myDashboard}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Return to My Authorized Dashboard ({role?.toUpperCase()})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={async () => {
                  await logout();
                  window.location.href = '/login';
                }}
                className="w-full py-2 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch Account / Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
