import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FeedPost } from '../../types';
import {
  fetchFeedPosts,
  createFeedPost,
  toggleLikePost,
  addPostComment,
  fetchPostComments,
  deleteFeedPost,
  reportFeedPost
} from '../../services/networkingService';
import { INITIAL_DEMO_SUGGESTED_PEOPLE } from '../../firebase/seedData';
import {
  MessageSquare,
  Heart,
  Share2,
  Send,
  Image as ImageIcon,
  Link as LinkIcon,
  MoreVertical,
  Trash2,
  Flag,
  Globe,
  Users,
  Sparkles,
  Bookmark,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  UserPlus
} from 'lucide-react';

export const FeedPage: React.FC = () => {
  const { currentUser, userProfile, role } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  // New post form state
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [projTitle, setProjTitle] = useState('');
  const [projUrl, setProjUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [showProjInput, setShowProjInput] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'connections'>('public');
  const [posting, setPosting] = useState(false);

  // Active filter tab: 'all' | 'saved'
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');

  // Expanded comments by post ID
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Menu dropdown open by post ID
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);

  // Saved post IDs in memory / local state
  const [savedPostIds, setSavedPostIds] = useState<string[]>(userProfile?.savedPostIds || []);

  const loadPosts = async () => {
    try {
      const data = await fetchFeedPosts();
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !userProfile) return;

    setPosting(true);
    try {
      const attachment = projTitle.trim() && projUrl.trim()
        ? { title: projTitle.trim(), url: projUrl.trim(), type: 'project' }
        : undefined;

      const newPost = await createFeedPost({
        authorProfile: userProfile,
        content: content.trim(),
        mediaUrl: mediaUrl.trim() || undefined,
        attachment,
        visibility
      });

      setPosts([newPost, ...posts]);
      setContent('');
      setMediaUrl('');
      setProjTitle('');
      setProjUrl('');
      setShowMediaInput(false);
      setShowProjInput(false);
    } catch (err: any) {
      alert('Failed to publish post: ' + err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (post: FeedPost) => {
    if (!currentUser) return;
    const isLiked = post.likedBy?.includes(currentUser.uid) || false;
    const updatedLikedBy = isLiked
      ? (post.likedBy || []).filter((u) => u !== currentUser.uid)
      : [...(post.likedBy || []), currentUser.uid];

    // Optimistic UI update
    setPosts(
      posts.map((p) =>
        p.id === post.id
          ? {
              ...p,
              likesCount: updatedLikedBy.length,
              likedBy: updatedLikedBy
            }
          : p
      )
    );

    await toggleLikePost(post.id, currentUser.uid, isLiked);
  };

  const handleToggleComments = async (postId: string) => {
    const isExpanded = !expandedComments[postId];
    setExpandedComments({ ...expandedComments, [postId]: isExpanded });

    if (isExpanded && !commentsMap[postId]) {
      const comments = await fetchPostComments(postId);
      setCommentsMap((prev) => ({ ...prev, [postId]: comments }));
    }
  };

  const handleSendComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text || !userProfile) return;

    try {
      const newComment = await addPostComment({
        postId,
        authorProfile: userProfile,
        content: text
      });

      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));

      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));

      setPosts(
        posts.map((p) =>
          p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
        )
      );
    } catch (e: any) {
      alert('Error commenting: ' + e.message);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    await deleteFeedPost(postId);
    setPosts(posts.filter((p) => p.id !== postId));
    setOpenMenuPostId(null);
  };

  const handleReportPost = async (postId: string) => {
    if (!currentUser) return;
    await reportFeedPost(postId, currentUser.uid);
    alert('Thank you. The post has been flagged for reviewer moderation.');
    setOpenMenuPostId(null);
  };

  const handleToggleSavePost = (postId: string) => {
    const isSaved = savedPostIds.includes(postId);
    const updated = isSaved ? savedPostIds.filter((id) => id !== postId) : [...savedPostIds, postId];
    setSavedPostIds(updated);
  };

  const [activeCategory, setActiveCategory] = useState<'all' | 'projects' | 'jobs' | 'hackathons' | 'achievements'>('all');
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);

  const filteredPosts = posts.filter((p) => {
    if (activeTab === 'saved') {
      return savedPostIds.includes(p.id);
    }
    if (selectedHashtag) {
      return p.content.toLowerCase().includes(selectedHashtag.toLowerCase());
    }
    if (activeCategory === 'projects') {
      return p.attachment?.type === 'project' || p.content.toLowerCase().includes('project') || p.content.toLowerCase().includes('github');
    }
    if (activeCategory === 'jobs') {
      return p.content.toLowerCase().includes('hiring') || p.content.toLowerCase().includes('internship') || p.content.toLowerCase().includes('opening') || p.authorRole === 'company';
    }
    if (activeCategory === 'hackathons') {
      return p.content.toLowerCase().includes('hackathon') || p.content.toLowerCase().includes('challenge') || p.content.toLowerCase().includes('badge');
    }
    if (activeCategory === 'achievements') {
      return p.content.toLowerCase().includes('achievement') || p.content.toLowerCase().includes('certified') || p.content.toLowerCase().includes('completed');
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: User Profile Summary Widget */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="h-16 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900" />
            <div className="px-5 pb-5 pt-0 relative text-center">
              <div className="w-16 h-16 rounded-full bg-slate-900 text-white font-extrabold text-xl flex items-center justify-center border-4 border-white shadow-xs mx-auto -mt-8">
                {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h3 className="mt-2 text-sm font-bold text-slate-900">
                {userProfile?.displayName || 'Candidate'}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                {userProfile?.headline || `${userProfile?.degree || 'Student'} • ${userProfile?.institution || 'Platform Member'}`}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
                <span className="text-slate-400">Role:</span>
                <span className="font-bold text-blue-700 capitalize">{role || 'Student'}</span>
              </div>
              <div className="mt-1 flex justify-between text-xs text-slate-600">
                <span className="text-slate-400">Assessments:</span>
                <span className="font-semibold text-slate-900">Verified</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  to={role === 'company' ? '/company/settings' : '/student/profile'}
                  className="block w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                >
                  View &amp; Edit Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('all')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between ${
                activeTab === 'all' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" /> All Professional Posts
              </span>
              <span className="text-slate-400 text-[11px]">{posts.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between ${
                activeTab === 'saved' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-600" /> Saved Posts
              </span>
              <span className="text-slate-400 text-[11px]">{savedPostIds.length}</span>
            </button>
            <Link
              to="/network"
              className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-slate-700 hover:bg-slate-50"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" /> My Network &amp; Connections
              </span>
            </Link>
            <Link
              to="/messages"
              className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-slate-700 hover:bg-slate-50"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-600" /> Direct Messaging
              </span>
            </Link>
          </div>
        </div>

        {/* Center Column: Feed Post Creator & Stream */}
        <div className="lg:col-span-6 space-y-6">
          {/* Post Creator Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share a project achievement, technical insight, assessment milestone, or industry question..."
                  className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed resize-none"
                />
              </div>
            </div>

            {/* Optional media input toggle */}
            {showMediaInput && (
              <div className="relative">
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Image URL (e.g. https://images.unsplash.com/...)"
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}

            {/* Optional project link toggle */}
            {showProjInput && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="Project or Repo Title (e.g. GraphQL Engine)"
                  className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="url"
                  value={projUrl}
                  onChange={(e) => setProjUrl(e.target.value)}
                  placeholder="URL (https://github.com/...)"
                  className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMediaInput(!showMediaInput)}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    showMediaInput ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <span className="hidden sm:inline">Add Image</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowProjInput(!showProjInput)}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    showProjInput ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 text-indigo-500" />
                  <span className="hidden sm:inline">Attach Project</span>
                </button>

                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
                >
                  <option value="public">Public</option>
                  <option value="connections">Network Only</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleCreatePost}
                disabled={posting || !content.trim()}
                className="py-2 px-5 bg-slate-900 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{posting ? 'Posting...' : 'Post'}</span>
              </button>
            </div>
          </div>

          {/* Category & Hashtag Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
              {[
                { id: 'all', label: 'All Updates' },
                { id: 'projects', label: 'Projects & Code' },
                { id: 'jobs', label: 'Jobs & Hiring' },
                { id: 'hackathons', label: 'Hackathons' },
                { id: 'achievements', label: 'Milestones' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id as any);
                    setSelectedHashtag(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    activeCategory === cat.id && !selectedHashtag
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Trending Hashtag Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span className="text-slate-400 font-bold uppercase tracking-wider mr-1">Trending:</span>
              {['#typescript', '#react', '#systemdesign', '#hiring', '#opensource', '#interviewprep'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSelectedHashtag(selectedHashtag === tag ? null : tag);
                  }}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    selectedHashtag === tag
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedHashtag && (
                <button
                  type="button"
                  onClick={() => setSelectedHashtag(null)}
                  className="text-slate-400 hover:text-slate-600 text-[10px] underline ml-1"
                >
                  Clear tag
                </button>
              )}
            </div>
          </div>

          {/* Posts Stream */}
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading verified community posts...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No posts in this view</p>
              <p>Be the first to share an engineering insight or update!</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isLiked = currentUser ? post.likedBy?.includes(currentUser.uid) : false;
              const isSaved = savedPostIds.includes(post.id);
              const isAuthor = currentUser?.uid === post.authorUid;
              const postComments = commentsMap[post.id] || [];

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-5 space-y-4"
                >
                  {/* Post Author Bar */}
                  <div className="flex items-start justify-between relative">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                        {post.authorAvatar ? (
                          <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                        ) : (
                          post.authorName?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {post.authorName}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-slate-100 text-slate-600">
                            {post.authorRole}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{post.authorHeadline}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Post Menu Options */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuPostId === post.id && (
                        <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 divide-y divide-slate-100 text-xs">
                          <button
                            onClick={() => {
                              handleToggleSavePost(post.id);
                              setOpenMenuPostId(null);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>{isSaved ? 'Remove from Saved' : 'Save Post'}</span>
                          </button>
                          {isAuthor ? (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete My Post</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReportPost(post.id)}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-600 flex items-center gap-2"
                            >
                              <Flag className="w-3.5 h-3.5" />
                              <span>Report Content</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Optional Media */}
                  {post.mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-100 max-h-80 bg-slate-100">
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Optional Project / Document Attachment */}
                  {post.attachment && (
                    <a
                      href={post.attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                          <LinkIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                            {post.attachment.title}
                          </p>
                          <span className="text-[10px] text-slate-400 truncate max-w-xs block">
                            {post.attachment.url}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                        Open &rarr;
                      </span>
                    </a>
                  )}

                  {/* Reaction Metrics */}
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
                    <span>{post.likesCount || 0} Likes</span>
                    <span>{post.commentsCount || 0} Comments</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <button
                      onClick={() => handleToggleLike(post)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        isLiked
                          ? 'text-rose-600 bg-rose-50'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                      <span>{isLiked ? 'Liked' : 'Like'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      <span>Comment</span>
                    </button>

                    <button
                      onClick={() => handleToggleSavePost(post.id)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        isSaved ? 'text-amber-600 bg-amber-50' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>

                  {/* Expandable Comments Section */}
                  {expandedComments[post.id] && (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      {/* Comment Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendComment(post.id);
                          }}
                          placeholder="Write a constructive response..."
                          className="flex-1 py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendComment(post.id)}
                          className="px-3 py-2 bg-slate-900 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                        >
                          Reply
                        </button>
                      </div>

                      {/* Comment List */}
                      <div className="space-y-2 pt-1">
                        {postComments.map((c) => (
                          <div key={c.id} className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{c.authorName}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(c.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{c.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Suggested Network & MNC Recruitment Feed */}
        <div className="lg:col-span-3 space-y-5">
          {/* Suggested Peers Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" /> Suggested Network
              </h4>
              <Link to="/network" className="text-[11px] font-bold text-blue-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3.5">
              {INITIAL_DEMO_SUGGESTED_PEOPLE.slice(0, 4).map((p) => (
                <div key={p.uid} className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                      {p.avatarUrl ? (
                        <img src={p.avatarUrl} alt={p.displayName} className="w-full h-full object-cover" />
                      ) : (
                        p.displayName.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{p.displayName}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{p.headline}</p>
                      <span className="text-[9px] text-slate-400">{p.mutualCount} mutual connections</span>
                    </div>
                  </div>
                  <Link
                    to="/network"
                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs shrink-0"
                    title="Connect"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Hiring Spotlight */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-5 rounded-2xl shadow-xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
              Recruitment Drive
            </span>
            <h4 className="text-sm font-bold leading-snug">
              CloudScale Global Graduate Engineering Drive
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              150+ associate positions open. Assessment badges boost shortlisting speed.
            </p>
            <Link
              to="/explore-jobs"
              className="inline-block py-2 px-3 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-xs transition-colors"
            >
              Explore Job Postings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
