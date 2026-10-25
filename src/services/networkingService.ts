import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

import { db, OperationType, handleFirestoreError } from '../firebase/config';
import {
  UserProfile,
  CompanyProfile,
  ConnectionRequest,
  FeedPost,
  PostComment,
  ChatMessage,
  Conversation,
  AppNotification,
  JobPosting,
  UserRole
} from '../types';
import { INITIAL_DEMO_POSTS, INITIAL_DEMO_SUGGESTED_PEOPLE, INITIAL_DEMO_JOBS, INITIAL_DEMO_COMPANIES } from '../firebase/seedData';

// ==================== CONNECTIONS ====================

export async function sendConnectionRequest(
  arg1: any,
  arg2?: string,
  arg3?: string,
  arg4?: string,
  arg5?: string,
  arg6?: string,
  arg7?: string,
  arg8?: string
): Promise<void> {
  let senderUid = '';
  let senderName = '';
  let senderHeadline = '';
  let senderAvatar = '';
  let senderRole = 'student';
  let recipientUid = '';
  let recipientName = '';

  if (typeof arg1 === 'object' && arg1 !== null) {
    const { senderProfile, recipientUid: rUid, recipientName: rName } = arg1;
    senderUid = senderProfile.uid;
    senderName = senderProfile.displayName;
    senderHeadline = senderProfile.headline || `${senderProfile.degree || 'Candidate'} @ ${senderProfile.institution || 'University'}`;
    senderAvatar = senderProfile.avatarUrl || senderProfile.photoUrl;
    senderRole = senderProfile.role || 'student';
    recipientUid = rUid;
    recipientName = rName;
  } else {
    senderUid = arg1;
    senderName = arg2 || 'Professional';
    senderHeadline = arg3 || 'Platform Member';
    senderAvatar = arg4 || '';
    recipientUid = arg5 || '';
    recipientName = arg6 || 'Professional';
  }

  const requestId = `req-${senderUid}-${recipientUid}`;
  const reqData: ConnectionRequest = {
    id: requestId,
    fromUid: senderUid,
    fromName: senderName,
    fromHeadline: senderHeadline,
    fromPhotoUrl: senderAvatar,
    toUid: recipientUid,
    toName: recipientName,
    toHeadline: arg7 || '',
    toPhotoUrl: arg8 || '',
    senderUid,
    senderName,
    senderAvatar,
    senderRole: (senderRole || 'student') as UserRole,
    senderHeadline,

    recipientUid,
    recipientName,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'connectionRequests', requestId), reqData);

    // Notify recipient
    await createNotification({
      recipientUid,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${senderName} (${senderHeadline}) would like to connect with you.`,
      link: '/network'
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `connectionRequests/${requestId}`);
  }
}

export async function acceptConnectionRequest(
  arg1: any,
  arg2?: string,
  arg3?: string
): Promise<void> {
  let requestId = '';
  let senderUid = '';
  let recipientName = 'Your connection';

  if (typeof arg1 === 'object' && arg1 !== null) {
    requestId = arg1.requestId;
    senderUid = arg1.senderUid;
    recipientName = arg1.recipientProfile?.displayName || 'User';
  } else {
    requestId = arg1;
    senderUid = arg2 || '';
  }

  try {
    await updateDoc(doc(db, 'connectionRequests', requestId), {
      status: 'accepted',
      updatedAt: new Date().toISOString()
    });

    if (senderUid) {
      await createNotification({
        recipientUid: senderUid,
        type: 'connection_accepted',
        title: 'Connection Accepted',
        message: `${recipientName} accepted your connection request.`,
        link: '/network'
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `connectionRequests/${requestId}`);
  }
}


export async function declineConnectionRequest(requestId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'connectionRequests', requestId), {
      status: 'declined',
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `connectionRequests/${requestId}`);
  }
}

export async function fetchConnectionRequests(uid: string): Promise<{
  received: ConnectionRequest[];
  sent: ConnectionRequest[];
}> {
  try {
    const receivedSnap = await getDocs(
      query(collection(db, 'connectionRequests'), where('recipientUid', '==', uid))
    );
    const sentSnap = await getDocs(
      query(collection(db, 'connectionRequests'), where('senderUid', '==', uid))
    );

    const received: ConnectionRequest[] = [];
    receivedSnap.forEach((d) => received.push(d.data() as ConnectionRequest));

    const sent: ConnectionRequest[] = [];
    sentSnap.forEach((d) => sent.push(d.data() as ConnectionRequest));

    return { received, sent };
  } catch (err) {
    console.warn('Fallback connection requests:', err);
    return { received: [], sent: [] };
  }
}

// ==================== PROFESSIONAL FEED ====================

export async function fetchFeedPosts(): Promise<FeedPost[]> {
  try {
    const snap = await getDocs(collection(db, 'feedPosts'));
    const dbPosts: FeedPost[] = [];
    snap.forEach((d) => {
      dbPosts.push({ id: d.id, ...(d.data() as any) });
    });

    // Sort descending by date
    dbPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Merge with initial demo posts without duplicates
    const merged: FeedPost[] = [...(INITIAL_DEMO_POSTS as any[])];
    dbPosts.forEach((dp: FeedPost) => {
      if (!merged.some((m) => m.id === dp.id)) {
        merged.unshift(dp);
      }
    });

    return merged;

  } catch (err) {
    console.warn('Using seeded feed posts:', err);
    return INITIAL_DEMO_POSTS as FeedPost[];
  }
}

export async function createFeedPost(params: {
  authorProfile: UserProfile;
  content: string;
  mediaUrl?: string;
  attachment?: { title: string; url: string; type: string };
  visibility?: 'public' | 'connections';
}): Promise<FeedPost> {
  const { authorProfile, content, mediaUrl, attachment, visibility = 'public' } = params;
  const postId = `post-${Date.now()}`;
  const newPost: FeedPost = {
    id: postId,
    authorUid: authorProfile.uid,
    authorName: authorProfile.displayName,
    authorRole: authorProfile.role,
    authorAvatar: authorProfile.avatarUrl,
    authorHeadline: authorProfile.headline || `${authorProfile.degree || 'Candidate'} @ ${authorProfile.institution || 'University'}`,
    content: content.trim(),
    mediaUrl: mediaUrl?.trim() || '',
    attachment,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    likedBy: [],
    savedBy: [],
    visibility,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'feedPosts', postId), newPost);
    return newPost;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `feedPosts/${postId}`);
    throw err;
  }
}

export async function toggleLikePost(postId: string, userUid: string, currentlyLiked: boolean): Promise<void> {
  try {
    const postRef = doc(db, 'feedPosts', postId);
    const snap = await getDoc(postRef);
    if (snap.exists()) {
      const data = snap.data() as FeedPost;
      const likedBy = data.likedBy || [];
      const updatedLikedBy = currentlyLiked
        ? likedBy.filter((u) => u !== userUid)
        : [...likedBy, userUid];
      await updateDoc(postRef, {
        likesCount: Math.max(0, updatedLikedBy.length),
        likedBy: updatedLikedBy,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('Error toggling like:', err);
  }
}

export async function addPostComment(params: {
  postId: string;
  authorProfile: UserProfile;
  content: string;
}): Promise<PostComment> {
  const { postId, authorProfile, content } = params;
  const commentId = `comment-${Date.now()}`;
  const comment: PostComment = {
    id: commentId,
    postId,
    authorUid: authorProfile.uid,
    authorName: authorProfile.displayName,
    authorRole: authorProfile.role,
    authorAvatar: authorProfile.avatarUrl,
    content: content.trim(),
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'postComments', commentId), comment);
    // increment post comment count
    const postRef = doc(db, 'feedPosts', postId);
    const snap = await getDoc(postRef);
    if (snap.exists()) {
      const p = snap.data() as FeedPost;
      await updateDoc(postRef, {
        commentsCount: (p.commentsCount || 0) + 1,
        updatedAt: new Date().toISOString()
      });
    }
    return comment;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `postComments/${commentId}`);
    throw err;
  }
}

export async function fetchPostComments(postId: string): Promise<PostComment[]> {
  try {
    const q = query(collection(db, 'postComments'), where('postId', '==', postId));
    const snap = await getDocs(q);
    const comments: PostComment[] = [];
    snap.forEach((d) => comments.push(d.data() as PostComment));
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return comments;
  } catch (err) {
    console.warn('Post comments fetch fallback:', err);
    return [];
  }
}

export async function deleteFeedPost(postId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'feedPosts', postId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `feedPosts/${postId}`);
  }
}

export async function reportFeedPost(postId: string, userUid: string): Promise<void> {
  try {
    const postRef = doc(db, 'feedPosts', postId);
    const snap = await getDoc(postRef);
    if (snap.exists()) {
      const data = snap.data() as FeedPost;
      const reportedBy = data.reportedBy || [];
      if (!reportedBy.includes(userUid)) {
        await updateDoc(postRef, {
          reportedBy: [...reportedBy, userUid],
          updatedAt: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.warn('Report post error:', err);
  }
}

// ==================== MESSAGING ====================

export async function getOrCreateConversation(
  userA: UserProfile,
  userB: { uid: string; displayName: string; role: 'student' | 'company' | 'admin' | 'reviewer'; avatarUrl?: string; headline?: string }
): Promise<Conversation> {
  const ids = [userA.uid, userB.uid].sort();
  const convId = `conv-${ids[0]}-${ids[1]}`;
  const convRef = doc(db, 'conversations', convId);

  try {
    const snap = await getDoc(convRef);
    if (snap.exists()) {
      return snap.data() as Conversation;
    }

    const newConv: Conversation = {
      id: convId,
      participantUids: ids,
      participantDetails: {
        [userA.uid]: {
          displayName: userA.displayName,
          avatarUrl: userA.avatarUrl,
          role: userA.role,
          headline: userA.headline || ''
        },
        [userB.uid]: {
          displayName: userB.displayName,
          avatarUrl: userB.avatarUrl,
          role: userB.role,
          headline: userB.headline || ''
        }
      },
      lastMessage: 'Conversation initialized',
      lastMessageSenderUid: userA.uid,
      lastMessageTimestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(convRef, newConv);
    return newConv;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `conversations/${convId}`);
    throw err;
  }
}

export async function fetchUserConversations(uid: string): Promise<Conversation[]> {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participantUids', 'array-contains', uid)
    );
    const snap = await getDocs(q);
    const list: Conversation[] = [];
    snap.forEach((d) => list.push(d.data() as Conversation));
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return list;
  } catch (err) {
    console.warn('Fetch conversations fallback:', err);
    return [];
  }
}

export async function sendChatMessage(params: {
  conversationId: string;
  senderProfile: UserProfile;
  recipientUid: string;
  text: string;
  attachmentUrl?: string;
}): Promise<ChatMessage> {
  const { conversationId, senderProfile, recipientUid, text, attachmentUrl } = params;
  const msgId = `msg-${Date.now()}`;
  const newMsg: ChatMessage = {
    id: msgId,
    conversationId,
    senderUid: senderProfile.uid,
    senderName: senderProfile.displayName,
    senderAvatar: senderProfile.avatarUrl,
    recipientUid,
    text: text.trim(),
    attachmentUrl,
    read: false,
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'chatMessages', msgId), newMsg);

    // Update parent conversation summary
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: text.trim(),
      lastMessageSenderUid: senderProfile.uid,
      lastMessageTimestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Notify recipient
    await createNotification({
      recipientUid,
      type: 'message',
      title: `New message from ${senderProfile.displayName}`,
      message: text.slice(0, 100),
      link: `/messages?conv=${conversationId}`
    });

    return newMsg;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `chatMessages/${msgId}`);
    throw err;
  }
}

export async function fetchMessagesForConversation(convId: string): Promise<ChatMessage[]> {
  try {
    const q = query(
      collection(db, 'chatMessages'),
      where('conversationId', '==', convId)
    );
    const snap = await getDocs(q);
    const list: ChatMessage[] = [];
    snap.forEach((d) => list.push(d.data() as ChatMessage));
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return list;
  } catch (err) {
    console.warn('Fetch messages fallback:', err);
    return [];
  }
}

// ==================== NOTIFICATIONS ====================

export async function createNotification(params: {
  recipientUid: string;
  type: AppNotification['type'];
  title: string;
  message: string;
  link?: string;
}): Promise<void> {
  const { recipientUid, type, title, message, link } = params;
  const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const notif: AppNotification = {
    id: notifId,
    recipientUid,
    type,
    title,
    message,
    read: false,
    link,
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'notifications', notifId), notif);
  } catch (err) {
    console.warn('Create notification error:', err);
  }
}

export async function fetchUserNotifications(recipientUid: string): Promise<AppNotification[]> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientUid', '==', recipientUid)
    );
    const snap = await getDocs(q);
    const list: AppNotification[] = [];
    snap.forEach((d) => list.push(d.data() as AppNotification));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    console.warn('Fetch notifications fallback:', err);
    return [];
  }
}

export async function markNotificationAsRead(notifId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notifId), {
      read: true
    });
  } catch (err) {
    console.warn('Error marking notification read:', err);
  }
}

// ==================== UNIVERSAL SEARCH ====================

export interface SearchResults {
  people: { uid: string; displayName: string; role: string; headline: string; institution?: string; skills: string[] }[];
  jobs: JobPosting[];
  companies: { id: string; name: string; industry: string; headquarters: string; verified: boolean }[];
  posts: FeedPost[];
}

export async function executeUniversalSearch(term: string): Promise<SearchResults> {
  const clean = term.toLowerCase().trim();

  // Filter demo companies
  const matchedCompanies = INITIAL_DEMO_COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(clean) ||
      c.industry.toLowerCase().includes(clean) ||
      c.headquarters.toLowerCase().includes(clean)
  ).map((c) => ({
    id: c.id,
    name: c.name,
    industry: c.industry,
    headquarters: c.headquarters,
    verified: c.verified
  }));

  // Filter demo jobs
  const matchedJobs = INITIAL_DEMO_JOBS.filter(
    (j) =>
      j.title.toLowerCase().includes(clean) ||
      j.companyName.toLowerCase().includes(clean) ||
      j.requiredSkills.some((s) => s.toLowerCase().includes(clean)) ||
      j.location.toLowerCase().includes(clean)
  );

  // Filter suggested peers
  const matchedPeople = INITIAL_DEMO_SUGGESTED_PEOPLE.filter(
    (p) =>
      p.displayName.toLowerCase().includes(clean) ||
      p.headline.toLowerCase().includes(clean) ||
      p.skills.some((s) => s.toLowerCase().includes(clean)) ||
      p.institutionOrCompany.toLowerCase().includes(clean)
  ).map((p) => ({
    uid: p.uid,
    displayName: p.displayName,
    role: p.role,
    headline: p.headline,
    institution: p.institutionOrCompany,
    skills: p.skills
  }));

  // Filter posts
  const posts = await fetchFeedPosts();
  const matchedPosts = posts.filter(
    (p) =>
      p.content.toLowerCase().includes(clean) ||
      p.authorName.toLowerCase().includes(clean) ||
      p.authorHeadline?.toLowerCase().includes(clean)
  );

  return {
    people: matchedPeople,
    jobs: matchedJobs,
    companies: matchedCompanies,
    posts: matchedPosts
  };
}

// ==================== ALIASES & COMPATIBILITY HELPERS ====================

export const getUserNotifications = fetchUserNotifications;
export const markNotificationRead = markNotificationAsRead;
export const getUserConversations = fetchUserConversations;
export const rejectConnectionRequest = declineConnectionRequest;

export async function getIncomingConnectionRequests(uid: string): Promise<ConnectionRequest[]> {
  try {
    const q1 = query(
      collection(db, 'connectionRequests'),
      where('recipientUid', '==', uid)
    );
    const snap = await getDocs(q1);
    const list: ConnectionRequest[] = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      if (data.status === 'pending') {
        list.push({
          id: d.id,
          ...data,
          fromUid: data.fromUid || data.senderUid,
          fromName: data.fromName || data.senderName || 'Member',
          fromHeadline: data.fromHeadline || data.senderHeadline || '',
          fromPhotoUrl: data.fromPhotoUrl || data.senderAvatar,
          toUid: data.toUid || data.recipientUid,
          toName: data.toName || data.recipientName || 'Member',
          toHeadline: data.toHeadline || '',
          toPhotoUrl: data.toPhotoUrl
        });
      }
    });
    return list;
  } catch (e) {
    console.warn('Fallback incoming connection requests:', e);
    return [];
  }
}

export async function getOutgoingConnectionRequests(uid: string): Promise<ConnectionRequest[]> {
  try {
    const q1 = query(
      collection(db, 'connectionRequests'),
      where('senderUid', '==', uid)
    );
    const snap = await getDocs(q1);
    const list: ConnectionRequest[] = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      if (data.status === 'pending') {
        list.push({
          id: d.id,
          ...data,
          fromUid: data.fromUid || data.senderUid,
          fromName: data.fromName || data.senderName || 'Member',
          fromHeadline: data.fromHeadline || data.senderHeadline || '',
          fromPhotoUrl: data.fromPhotoUrl || data.senderAvatar,
          toUid: data.toUid || data.recipientUid,
          toName: data.toName || data.recipientName || 'Member',
          toHeadline: data.toHeadline || '',
          toPhotoUrl: data.toPhotoUrl
        });
      }
    });
    return list;
  } catch (e) {
    console.warn('Fallback outgoing connection requests:', e);
    return [];
  }
}

export async function getUserConnections(uid: string): Promise<UserProfile[]> {
  try {
    const q1 = query(
      collection(db, 'connectionRequests'),
      where('status', '==', 'accepted')
    );
    const snap = await getDocs(q1);
    const connectedUids: string[] = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      const sUid = data.senderUid || data.fromUid;
      const rUid = data.recipientUid || data.toUid;
      if (sUid === uid && rUid && !connectedUids.includes(rUid)) {
        connectedUids.push(rUid);
      } else if (rUid === uid && sUid && !connectedUids.includes(sUid)) {
        connectedUids.push(sUid);
      }
    });

    const profiles: UserProfile[] = [];
    for (const otherUid of connectedUids) {
      const userDoc = await getDoc(doc(db, 'users', otherUid));
      if (userDoc.exists()) {
        profiles.push({ uid: userDoc.id, ...(userDoc.data() as any) });
      } else {
        const demo = INITIAL_DEMO_SUGGESTED_PEOPLE.find((p) => p.uid === otherUid);
        if (demo) {
          profiles.push(demo as any);
        }
      }
    }
    return profiles;
  } catch (e) {
    console.warn('Fallback user connections:', e);
    return [];
  }
}

export async function removeConnection(userUid: string, targetUid: string): Promise<void> {
  try {
    const q1 = query(
      collection(db, 'connectionRequests'),
      where('status', '==', 'accepted')
    );
    const snap = await getDocs(q1);
    snap.forEach(async (d) => {
      const data = d.data() as any;
      const s = data.senderUid || data.fromUid;
      const r = data.recipientUid || data.toUid;
      if ((s === userUid && r === targetUid) || (s === targetUid && r === userUid)) {
        await deleteDoc(doc(db, 'connectionRequests', d.id));
      }
    });
  } catch (e) {
    console.error('Error removing connection:', e);
  }
}

export function listenToMessages(
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  try {
    const q = query(
      collection(db, 'chatMessages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((d) => msgs.push({ id: d.id, ...(d.data() as any) }));
        callback(msgs);
      },
      (error) => {
        console.warn('Snapshot listener fallback:', error);
        fetchMessagesForConversation(conversationId).then(callback);
      }
    );
  } catch (e) {
    console.warn('Listener setup error, using one-time fetch:', e);
    fetchMessagesForConversation(conversationId).then(callback);
    return () => {};
  }
}

export async function sendMessage(
  conversationId: string,
  senderUid: string,
  recipientUid: string,
  text: string
): Promise<ChatMessage> {
  const msgId = `msg-${Date.now()}`;
  const newMsg: ChatMessage = {
    id: msgId,
    conversationId,
    senderUid,
    senderName: 'You',
    recipientUid,
    text: text.trim(),
    read: false,
    createdAt: new Date().toISOString()
  };


  try {
    await setDoc(doc(db, 'chatMessages', msgId), newMsg);
    await setDoc(
      doc(db, 'conversations', conversationId),
      {
        id: conversationId,
        participants: [senderUid, recipientUid],
        lastMessageText: text.trim(),
        lastMessageSenderUid: senderUid,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    return newMsg;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `chatMessages/${msgId}`);
    throw err;
  }
}

export async function markConversationRead(conversationId: string, userUid: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'conversations', conversationId), {
      [`unreadCount.${userUid}`]: 0,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    // Optional unread count update
  }
}

export async function followCompany(userUid: string, companyId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userUid);
    await updateDoc(userRef, {
      followingCompanies: arrayUnion(companyId)
    });
  } catch (e) {
    console.warn('Follow company error:', e);
  }
}

export async function unfollowCompany(userUid: string, companyId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userUid);
    await updateDoc(userRef, {
      followingCompanies: arrayRemove(companyId)
    });
  } catch (e) {
    console.warn('Unfollow company error:', e);
  }
}

export async function searchGlobal(term: string): Promise<{
  people: UserProfile[];
  companies: CompanyProfile[];
  jobs: JobPosting[];
  posts: FeedPost[];
}> {
  const clean = term.toLowerCase().trim();

  // Matched Companies
  const matchedCompanies: CompanyProfile[] = INITIAL_DEMO_COMPANIES.filter(
    (c) =>
      (c.name || c.companyName || '').toLowerCase().includes(clean) ||
      (c.industry || '').toLowerCase().includes(clean) ||
      (c.headquarters || c.location || '').toLowerCase().includes(clean) ||
      (c.description || '').toLowerCase().includes(clean)
  ).map((c) => ({
    id: c.id,
    companyName: c.name || c.companyName || 'Enterprise Partner',
    name: c.name || c.companyName,
    ownerUid: c.id,
    recruiterName: 'Talent Acquisition Team',
    workEmail: `careers@${c.id}.com`,
    industry: c.industry,
    website: `https://${c.id}.example.com`,
    location: c.headquarters || c.location || 'Global',
    about: c.description,
    description: c.description,
    verificationStatus: 'verified' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  // Matched Jobs
  const matchedJobs = INITIAL_DEMO_JOBS.filter(
    (j) =>
      j.title.toLowerCase().includes(clean) ||
      j.companyName.toLowerCase().includes(clean) ||
      j.requiredSkills.some((s) => s.toLowerCase().includes(clean)) ||
      j.location.toLowerCase().includes(clean)
  );

  // Matched People
  const matchedPeople: UserProfile[] = INITIAL_DEMO_SUGGESTED_PEOPLE.filter(
    (p) =>
      (p.displayName || '').toLowerCase().includes(clean) ||
      (p.headline || '').toLowerCase().includes(clean) ||
      (p.degree || '').toLowerCase().includes(clean) ||
      (p.institution || p.institutionOrCompany || '').toLowerCase().includes(clean) ||
      (p.skills || []).some((s) => s.toLowerCase().includes(clean))
  ).map((p) => ({
    uid: p.uid,
    displayName: p.displayName,
    email: `${p.uid}@careerpulse.student`,
    role: p.role as any,
    headline: p.headline,
    institution: p.institution || p.institutionOrCompany,
    degree: p.degree || 'Computer Science & Engineering',
    skills: p.skills,
    softSkills: ['Communication', 'Teamwork', 'Problem Solving'],
    projects: [],
    certifications: [],
    profileVisibility: 'public' as const,
    profileCompleted: true,
    avatarUrl: p.avatarUrl || p.photoUrl,
    photoUrl: p.photoUrl || p.avatarUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  // Matched Posts
  const allPosts = await fetchFeedPosts();
  const matchedPosts = allPosts.filter(
    (p) =>
      p.content.toLowerCase().includes(clean) ||
      p.authorName.toLowerCase().includes(clean) ||
      (p.authorHeadline || '').toLowerCase().includes(clean)
  );

  return {
    people: matchedPeople,
    companies: matchedCompanies,
    jobs: matchedJobs,
    posts: matchedPosts
  };
}


