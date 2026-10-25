import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  writeBatch
} from 'firebase/firestore';
import { AppNotification } from '../../types';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Briefcase,
  AlertTriangle,
  MessageSquare,
  Users,
  Check,
  CheckCheck,
  X,
  ExternalLink,
  Filter,
  Sparkles,
  Info
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen?: boolean;
  onClose?: () => void;
  inline?: boolean;
}

type NotificationCategory = 'all' | 'applications' | 'interviews' | 'system';

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen = true,
  onClose,
  inline = false
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
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
          const list: AppNotification[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as any) });
          });
          // Sort client-side by createdAt descending to avoid composite index requirement
          list.sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          setNotifications(list);
          setLoading(false);
        },
        (err) => {
          console.warn('Real-time notifications subscription notice:', err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('Failed to attach notifications listener:', e);
      setLoading(false);
    }
  }, [currentUser]);

  const handleMarkAsRead = async (notifId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setUpdatingId(notifId);
      await updateDoc(doc(db, 'notifications', notifId), {
        read: true,
        updatedAt: new Date().toISOString()
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification read:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadList = notifications.filter((n) => !n.read);
    if (unreadList.length === 0) return;

    try {
      const batch = writeBatch(db);
      unreadList.forEach((n) => {
        batch.update(doc(db, 'notifications', n.id), {
          read: true,
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      handleMarkAsRead(notif.id);
    }
    if (notif.link) {
      if (onClose) onClose();
      navigate(notif.link);
    }
  };

  const formatTimestamp = (isoString?: string): string => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getCategoryIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'interview_scheduled':
        return <Calendar className="w-4 h-4 text-violet-600" />;
      case 'application_update':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'challenge_update':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-sky-600" />;
      case 'connection_request':
      case 'connection_accepted':
        return <Users className="w-4 h-4 text-indigo-600" />;
      case 'system':
      default:
        return <Info className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getCategoryBadgeClass = (type: AppNotification['type']) => {
    switch (type) {
      case 'interview_scheduled':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'application_update':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'challenge_update':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'message':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'connection_request':
      case 'connection_accepted':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'system':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getCategoryLabel = (type: AppNotification['type']): string => {
    switch (type) {
      case 'interview_scheduled':
        return 'Interview';
      case 'application_update':
        return 'Application';
      case 'challenge_update':
        return 'Challenge';
      case 'message':
        return 'Message';
      case 'connection_request':
        return 'Network Request';
      case 'connection_accepted':
        return 'Connection';
      case 'system':
      default:
        return 'System Alert';
    }
  };

  // Filter items
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'applications') return n.type === 'application_update';
    if (activeTab === 'interviews') return n.type === 'interview_scheduled';
    if (activeTab === 'system') {
      return (
        n.type === 'system' ||
        n.type === 'challenge_update' ||
        n.type === 'connection_request' ||
        n.type === 'connection_accepted' ||
        n.type === 'message'
      );
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const content = (
    <div className={`bg-white ${inline ? 'rounded-2xl border border-slate-200 shadow-sm' : 'rounded-2xl shadow-2xl border border-slate-200'} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Bell className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Notification Center</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Live application status, interview alerts &amp; system updates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}

          {!inline && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>All</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {notifications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'applications'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Applications</span>
        </button>

        <button
          onClick={() => setActiveTab('interviews')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'interviews'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Interviews</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'system'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>System &amp; Alerts</span>
        </button>
      </div>

      {/* Notification List Body */}
      <div className={`overflow-y-auto divide-y divide-slate-100 ${inline ? 'max-h-[500px]' : 'max-h-[380px] sm:max-h-[440px]'}`}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">No notifications here</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {activeTab === 'all'
                  ? 'You are all caught up! When applications update or interviews are scheduled, alerts will appear here.'
                  : `No ${activeTab} notifications found right now.`}
              </p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isUnread = !n.read;
            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 sm:p-4 flex items-start gap-3 transition-colors cursor-pointer group ${
                  isUnread
                    ? 'bg-blue-50/50 hover:bg-blue-50/80 border-l-4 border-l-blue-600'
                    : 'bg-white hover:bg-slate-50 border-l-4 border-l-transparent'
                }`}
              >
                {/* Icon box */}
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {getCategoryIcon(n.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                        n.type
                      )}`}
                    >
                      {getCategoryLabel(n.type)}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {formatTimestamp(n.createdAt)}
                    </span>
                  </div>

                  <h5
                    className={`text-xs leading-snug truncate ${
                      isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                    }`}
                  >
                    {n.title}
                  </h5>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-1">
                    {n.link ? (
                      <span className="text-[10px] font-bold text-blue-700 group-hover:text-blue-900 flex items-center gap-1">
                        <span>View details</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    ) : (
                      <span />
                    )}

                    {isUnread && (
                      <button
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        disabled={updatingId === n.id}
                        className="text-[10px] font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white transition-colors"
                      >
                        <Check className="w-3 h-3 text-slate-400" />
                        <span>Mark read</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer status summary */}
      <div className="p-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time sync active</span>
        </span>
        {notifications.length > 0 && (
          <span>
            {unreadCount} unread of {notifications.length} total
          </span>
        )}
      </div>
    </div>
  );

  if (inline) {
    return content;
  }

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 md:w-[420px] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      {content}
    </div>
  );
};
