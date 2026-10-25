import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getUserConversations,
  listenToMessages,
  sendMessage,
  markConversationRead,
  getUserConnections
} from '../../services/networkingService';
import { Conversation, ChatMessage, UserProfile } from '../../types';
import {
  MessageSquare,
  Send,
  Search,
  User,
  Plus,
  CheckCheck,
  Check,
  Sparkles,
  Users,
  Clock,
  ArrowLeft
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<UserProfile[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations and connections
  const loadData = async () => {
    if (!currentUser) return;
    try {
      const [convs, conns] = await Promise.all([
        getUserConversations(currentUser.uid),
        getUserConnections(currentUser.uid)
      ]);
      setConversations(convs);
      setConnections(conns);

      // Select first conversation or query param target
      if (convs.length > 0 && !selectedConversation) {
        setSelectedConversation(convs[0]);
      }
    } catch (e) {
      console.error('Error loading conversations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Listen to messages of selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    if (currentUser) {
      markConversationRead(selectedConversation.id, currentUser.uid).catch(console.error);
    }

    const unsubscribe = listenToMessages(selectedConversation.id, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [selectedConversation, currentUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedConversation || !inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const otherParticipantId =
        (selectedConversation.participants || []).find((p) => p !== currentUser.uid) || '';


      await sendMessage(selectedConversation.id, currentUser.uid, otherParticipantId, text);
      loadData();
    } catch (e) {
      console.error('Failed to send message:', e);
      alert('Could not send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleStartChatWith = (user: UserProfile) => {
    if (!currentUser) return;
    const convId = [currentUser.uid, user.uid].sort().join('_');
    const existing = conversations.find((c) => c.id === convId);

    if (existing) {
      setSelectedConversation(existing);
    } else {
      const newConv: Conversation = {
        id: convId,
        participants: [currentUser.uid, user.uid],
        participantDetails: {
          [currentUser.uid]: {
            name: userProfile?.displayName || currentUser.email || 'You',
            headline: userProfile?.headline || userProfile?.degree || '',
            photoUrl: userProfile?.photoUrl
          },
          [user.uid]: {
            name: user.displayName || 'Professional',
            headline: user.headline || user.degree || '',
            photoUrl: user.photoUrl
          }
        },
        unreadCount: {
          [currentUser.uid]: 0,
          [user.uid]: 0
        },
        updatedAt: new Date().toISOString()
      };
      setConversations((prev) => [newConv, ...prev]);
      setSelectedConversation(newConv);
    }
    setShowNewChatModal(false);
  };

  const getOtherParticipant = (conv: Conversation) => {
    if (!currentUser) return { name: 'Member', headline: '' };
    const otherId = (conv.participants || []).find((p) => p !== currentUser.uid) || '';

    return conv.participantDetails?.[otherId] || { name: 'Member', headline: '' };
  };

  const filteredConversations = conversations.filter((c) => {
    const other = getOtherParticipant(c);
    return (
      other.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (c.lastMessageText || '').toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col md:flex-row h-[780px]">
        {/* Left Column: Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 ${
            selectedConversation ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-700" />
                Messaging
              </h1>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                title="Start New Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold">No conversations yet</p>
                <p className="text-[11px] text-slate-400 mt-1">Connect with peers to start messaging.</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <Plus className="w-3.5 h-3.5" /> Start Conversation
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isSelected = selectedConversation?.id === conv.id;
                const unread = currentUser ? conv.unreadCount?.[currentUser.uid] || 0 : 0;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                      isSelected ? 'bg-blue-50/80 border-l-4 border-blue-700' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
                      {other.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{other.name}</h4>
                        {conv.updatedAt && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(conv.updatedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mb-1">
                        {other.headline || 'Member'}
                      </p>
                      <p className="text-xs text-slate-600 truncate font-normal">
                        {conv.lastMessageText || 'Started a conversation'}
                      </p>
                    </div>

                    {unread > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-blue-700 rounded-full shrink-0">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            {(() => {
              const other = getOtherParticipant(selectedConversation);
              return (
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-2xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center">
                      {other.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{other.name}</h3>
                      <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                        {other.headline || 'CareerPulse Connected Member'}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Direct Channel
                  </span>
                </div>
              );
            })()}

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-medium">Say hello to kick off your career conversation!</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Ask about career advice, interview experiences, or collaboration opportunities.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderUid === currentUser?.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-2xs ${
                          isMe
                            ? 'bg-blue-900 text-white rounded-br-xs'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {isMe && (
                          <CheckCheck
                            className={`w-3.5 h-3.5 ${
                              msg.read ? 'text-blue-600' : 'text-slate-400'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder="Write a professional message... (Press Enter to send)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={sending}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-50 rounded-xl transition-all shadow-xs"
              >
                <Send className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-50/20">
            <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Select a message to start</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Connect with fellow university peers, mentors, and company talent scouts in real-time.
            </p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-700" />
                Start a New Conversation
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Choose a connected peer or recommended mentor from your network:
            </p>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {connections.length > 0 ? (
                connections.map((c) => (
                  <button
                    key={c.uid}
                    onClick={() => handleStartChatWith(c)}
                    className="w-full py-3 px-2 flex items-center gap-3 hover:bg-slate-50 rounded-xl text-left transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center">
                      {c.displayName ? c.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{c.displayName}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{c.headline || c.degree}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-6 text-center text-slate-500 text-xs">
                  No direct connections found yet. Visit the{' '}
                  <span className="font-bold text-blue-700">Grow Network</span> tab to invite peers.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
