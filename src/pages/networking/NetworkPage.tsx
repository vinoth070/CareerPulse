import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getIncomingConnectionRequests,
  getOutgoingConnectionRequests,
  getUserConnections,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection
} from '../../services/networkingService';
import { ConnectionRequest, UserProfile } from '../../types';
import { INITIAL_DEMO_SUGGESTED_PEOPLE } from '../../firebase/seedData';
import {
  Users,
  UserPlus,
  Check,
  X,
  MessageSquare,
  Search,
  Building2,
  GraduationCap,
  Sparkles,
  UserCheck,
  Clock,
  Trash2,
  ExternalLink
} from 'lucide-react';

export const NetworkPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'grow' | 'pending' | 'connections'>('grow');
  const [incoming, setIncoming] = useState<ConnectionRequest[]>([]);
  const [outgoing, setOutgoing] = useState<ConnectionRequest[]>([]);
  const [connections, setConnections] = useState<UserProfile[]>([]);
  const [suggestedPeople, setSuggestedPeople] = useState<any[]>(INITIAL_DEMO_SUGGESTED_PEOPLE);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const refreshData = async () => {
    if (!currentUser) return;
    try {
      const [inc, out, conns] = await Promise.all([
        getIncomingConnectionRequests(currentUser.uid),
        getOutgoingConnectionRequests(currentUser.uid),
        getUserConnections(currentUser.uid)
      ]);
      setIncoming(inc);
      setOutgoing(out);
      setConnections(conns);

      // Exclude already connected or pending from suggested
      const connectedUids = new Set([
        currentUser.uid,
        ...conns.map(c => c.uid),
        ...inc.map(i => i.fromUid),
        ...out.map(o => o.toUid)
      ]);

      const filtered = INITIAL_DEMO_SUGGESTED_PEOPLE.filter(p => !connectedUids.has(p.uid));
      setSuggestedPeople(filtered);
    } catch (e) {
      console.error('Error fetching network data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  const handleConnect = async (targetUser: any) => {
    if (!currentUser) return;
    try {
      await sendConnectionRequest(
        currentUser.uid,
        userProfile?.displayName || currentUser.email || 'Professional',
        userProfile?.headline || userProfile?.degree || 'Member',
        userProfile?.photoUrl,
        targetUser.uid,
        targetUser.displayName || 'Professional',

        targetUser.headline || targetUser.degree || 'Member',
        targetUser.photoUrl
      );
      setActionNotice(`Connection request sent to ${targetUser.displayName}!`);
      setTimeout(() => setActionNotice(null), 3000);
      refreshData();
    } catch (e: any) {
      alert(e.message || 'Error sending connection request');
    }
  };

  const handleAccept = async (req: ConnectionRequest) => {
    try {
      await acceptConnectionRequest(req.id, req.fromUid, req.toUid);
      setActionNotice(`Connected with ${req.fromName}!`);
      setTimeout(() => setActionNotice(null), 3000);
      refreshData();
    } catch (e: any) {
      alert(e.message || 'Error accepting connection');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectConnectionRequest(requestId);
      refreshData();
    } catch (e: any) {
      alert(e.message || 'Error ignoring request');
    }
  };

  const handleRemove = async (targetUid: string) => {
    if (!currentUser || !confirm('Are you sure you want to remove this connection?')) return;
    try {
      await removeConnection(currentUser.uid, targetUid);
      refreshData();
    } catch (e: any) {
      alert(e.message || 'Error removing connection');
    }
  };

  const filteredConnections = connections.filter(c =>
    (c.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.headline || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.institution || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner / Heading */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-700 text-xs font-bold tracking-wider uppercase mb-1">
              <Users className="w-4 h-4" /> Professional Network
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Manage your connections &amp; expand your reach
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Connect with fellow students, alumni, tech recruiters, and industry mentors. Build meaningful relationships that open career opportunities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/messages"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-slate-600" />
              Direct Messages
            </Link>
            <Link
              to="/search?tab=people"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors shadow-xs"
            >
              <Search className="w-4 h-4" />
              Find People
            </Link>
          </div>
        </div>

        {actionNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600" />
            {actionNotice}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('grow')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'grow'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Grow Network
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-semibold">
              {suggestedPeople.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            Invitations
            {(incoming.length > 0 || outgoing.length > 0) && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-bold">
                {incoming.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('connections')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'connections'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            My Connections
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-semibold">
              {connections.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: Grow Network / Suggested People */}
      {activeTab === 'grow' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recommended Connections for You</h2>
            <p className="text-xs text-slate-500">Based on your skills, university, and career goals</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {suggestedPeople.map((person) => (
              <div
                key={person.uid}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="h-14 -mx-5 -mt-5 bg-gradient-to-r from-slate-100 to-blue-50/50 border-b border-slate-100" />
                <div className="-mt-8 mb-3 flex items-center justify-between">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-extrabold text-xl flex items-center justify-center border-4 border-white shadow-xs">
                    {person.displayName ? person.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {person.role || 'Member'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{person.displayName}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {person.headline || person.degree || 'Software Engineering Enthusiast'}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{person.institution || 'Verified Academy'}</span>
                  </div>

                  {person.skills && person.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {person.skills.slice(0, 3).map((s: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleConnect(person)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-blue-900 rounded-xl transition-colors shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Connect
                  </button>
                  <Link
                    to={`/search?q=${encodeURIComponent(person.displayName || '')}`}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                    title="View Profile"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {suggestedPeople.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <UserCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">You are connected with everyone suggested!</h3>
              <p className="text-sm text-slate-500 mt-1">Check back later or search for specific peers across universities.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Pending Invitations */}
      {activeTab === 'pending' && (
        <div className="space-y-8">
          {/* Incoming */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-700" />
              Received Invitations ({incoming.length})
            </h2>

            {incoming.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No pending invitations waiting for your response.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {incoming.map((req) => (
                  <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center">
                        {(req.fromName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{req.fromName || 'User'}</h4>
                        <p className="text-xs text-slate-600">{req.fromHeadline || 'Member'}</p>
                        <span className="text-[10px] text-slate-400">
                          Sent {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAccept(req)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Ignore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Sent Invitations ({outgoing.length})
            </h2>

            {outgoing.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">You have not sent any pending invitations.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {outgoing.map((req) => (
                  <div key={req.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200">
                        {(req.toName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{req.toName || 'User'}</h4>
                        <p className="text-xs text-slate-500">{req.toHeadline || 'Member'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: My Connections */}
      {activeTab === 'connections' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Connected Professionals ({connections.length})
              </h2>
              <p className="text-xs text-slate-500">Your verified direct network</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {filteredConnections.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No connections found.</p>
              <button
                onClick={() => setActiveTab('grow')}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                Grow your network now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredConnections.map((c) => (
                <div
                  key={c.uid}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center shrink-0">
                      {c.displayName ? c.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{c.displayName}</h4>
                      <p className="text-xs text-slate-600 truncate">{c.headline || c.degree || 'Connected Member'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{c.institution}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to="/messages"
                      className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                      title="Send Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleRemove(c.uid)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Remove Connection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
