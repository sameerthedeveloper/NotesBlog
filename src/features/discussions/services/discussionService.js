import { db, auth } from "../../../firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment
} from "firebase/firestore";

const TOPICS_COLLECTION = "discussionTopics";
const REPLIES_COLLECTION = "discussionReplies";
const LIKES_COLLECTION = "discussionLikes";
const NOTES_COLLECTION = "notes";

/**
 * Real-time listener for discussion topics for a given note.
 */
export const subscribeTopics = (noteId, callback) => {
  if (!noteId) {
    callback([]);
    return () => {};
  }

  const primaryQuery = query(
    collection(db, TOPICS_COLLECTION),
    where("noteId", "==", noteId),
    orderBy("isPinned", "desc"),
    orderBy("updatedAt", "desc")
  );

  let unsubFallback = null;

  const unsubPrimary = onSnapshot(
    primaryQuery,
    (snapshot) => {
      const topics = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      callback(topics);
    },
    (error) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("subscribeTopics primary query error (falling back to memory sort):", error);
      }
      const fallbackQuery = query(
        collection(db, TOPICS_COLLECTION),
        where("noteId", "==", noteId)
      );
      unsubFallback = onSnapshot(
        fallbackQuery,
        (snapshot) => {
          const topics = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data()
          }));
          topics.sort((a, b) => {
            if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
            const tA = a.updatedAt?.seconds || 0;
            const tB = b.updatedAt?.seconds || 0;
            return tB - tA;
          });
          callback(topics);
        },
        (fallbackErr) => {
          if (process.env.NODE_ENV !== "production") console.error("subscribeTopics fallback error:", fallbackErr);
          callback([]);
        }
      );
    }
  );

  return () => {
    unsubPrimary();
    if (unsubFallback) unsubFallback();
  };
};

/**
 * Real-time listener for replies under a specific topic.
 */
export const subscribeReplies = (topicId, callback) => {
  if (!topicId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, REPLIES_COLLECTION),
    where("topicId", "==", topicId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const replies = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      callback(replies);
    },
    (error) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("subscribeReplies listener error:", error);
      }
      callback([]);
    }
  );
};

/**
 * Real-time listener for user's liked topics and replies.
 */
export const subscribeUserLikes = (userId, callback) => {
  if (!userId) {
    callback(new Set());
    return () => {};
  }

  const q = query(
    collection(db, LIKES_COLLECTION),
    where("userId", "==", userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const likedIds = new Set(snapshot.docs.map((d) => d.data().targetId));
      callback(likedIds);
    },
    (error) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("subscribeUserLikes listener error:", error);
      }
      callback(new Set());
    }
  );
};

/**
 * Create a new discussion topic.
 */
export const createTopic = async (noteId, topicData, userProfile, noteAuthorId) => {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId) throw new Error("Authentication required to start a discussion.");

  const payload = {
    noteId,
    noteAuthorId: noteAuthorId || "",
    authorId: currentUserId,
    authorName: userProfile?.displayName || userProfile?.name || auth.currentUser.displayName || "Anonymous",
    authorPhoto: userProfile?.photoURL || auth.currentUser.photoURL || "",
    title: topicData.title.trim(),
    content: topicData.content.trim(),
    category: topicData.category || "General",
    tags: topicData.tags || [],
    replyCount: 0,
    likeCount: 0,
    viewCount: 0,
    isPinned: false,
    isLocked: false,
    isSolved: false,
    bestAnswerReplyId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, TOPICS_COLLECTION), payload);

  // Increment discussion count on main note document (if it's a note topic, not global community)
  if (noteId && noteId !== "global_community") {
    try {
      const noteRef = doc(db, NOTES_COLLECTION, noteId);
      await updateDoc(noteRef, {
        discussionCount: increment(1),
        lastDiscussionActivity: serverTimestamp()
      });
    } catch {
      // Non-fatal if note update fails
    }
  }

  return docRef.id;
};

/**
 * Create a reply under a topic (supports nested replies).
 */
export const createReply = async (topicId, replyData, userProfile, noteAuthorId) => {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId) throw new Error("Authentication required to post a reply.");

  const payload = {
    topicId,
    parentReplyId: replyData.parentReplyId || null,
    authorId: currentUserId,
    authorName: userProfile?.displayName || userProfile?.name || auth.currentUser.displayName || "Anonymous",
    authorPhoto: userProfile?.photoURL || auth.currentUser.photoURL || "",
    noteAuthorId: noteAuthorId || "",
    content: replyData.content.trim(),
    codeSnippet: replyData.codeSnippet || "",
    codeLanguage: replyData.codeLanguage || "",
    attachments: replyData.attachments || [],
    likes: 0,
    deleted: false,
    createdAt: serverTimestamp(),
    editedAt: null
  };

  const docRef = await addDoc(collection(db, REPLIES_COLLECTION), payload);

  // Increment reply count and update activity on topic
  try {
    const topicRef = doc(db, TOPICS_COLLECTION, topicId);
    await updateDoc(topicRef, {
      replyCount: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch {
    // Non-fatal
  }

  return docRef.id;
};

/**
 * Toggle upvote / like on a topic.
 */
export const toggleLikeTopic = async (topicId, userId) => {
  if (!userId) throw new Error("Authentication required.");

  const likeDocId = `${userId}_topic_${topicId}`;
  const likeRef = doc(db, LIKES_COLLECTION, likeDocId);
  const topicRef = doc(db, TOPICS_COLLECTION, topicId);

  const likeSnap = await getDoc(likeRef);
  if (likeSnap.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(topicRef, { likeCount: increment(-1) });
  } else {
    await setDoc(likeRef, {
      userId,
      targetId: topicId,
      targetType: "topic",
      createdAt: serverTimestamp()
    });
    await updateDoc(topicRef, { likeCount: increment(1) });
  }
};

/**
 * Toggle upvote / like on a reply.
 */
export const toggleLikeReply = async (replyId, userId) => {
  if (!userId) throw new Error("Authentication required.");

  const likeDocId = `${userId}_reply_${replyId}`;
  const likeRef = doc(db, LIKES_COLLECTION, likeDocId);
  const replyRef = doc(db, REPLIES_COLLECTION, replyId);

  const likeSnap = await getDoc(likeRef);
  if (likeSnap.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(replyRef, { likes: increment(-1) });
  } else {
    await setDoc(likeRef, {
      userId,
      targetId: replyId,
      targetType: "reply",
      createdAt: serverTimestamp()
    });
    await updateDoc(replyRef, { likes: increment(1) });
  }
};

/**
 * Creator tool: Mark topic as solved with a best answer reply.
 */
export const markTopicSolved = async (topicId, replyId = null, isSolved = true) => {
  const topicRef = doc(db, TOPICS_COLLECTION, topicId);
  await updateDoc(topicRef, {
    isSolved,
    bestAnswerReplyId: isSolved ? replyId : null,
    updatedAt: serverTimestamp()
  });
};

/**
 * Creator/Mod tool: Lock discussion thread.
 */
export const toggleLockTopic = async (topicId, isLocked) => {
  const topicRef = doc(db, TOPICS_COLLECTION, topicId);
  await updateDoc(topicRef, {
    isLocked,
    updatedAt: serverTimestamp()
  });
};

/**
 * Creator/Mod tool: Pin discussion thread.
 */
export const togglePinTopic = async (topicId, isPinned) => {
  const topicRef = doc(db, TOPICS_COLLECTION, topicId);
  await updateDoc(topicRef, {
    isPinned,
    updatedAt: serverTimestamp()
  });
};

/**
 * Delete a topic document.
 */
export const deleteTopic = async (topicId) => {
  await deleteDoc(doc(db, TOPICS_COLLECTION, topicId));
};

/**
 * Delete a reply.
 */
export const deleteReply = async (replyId, topicId) => {
  await deleteDoc(doc(db, REPLIES_COLLECTION, replyId));
  if (topicId) {
    try {
      const topicRef = doc(db, TOPICS_COLLECTION, topicId);
      await updateDoc(topicRef, {
        replyCount: increment(-1)
      });
    } catch {
      // Ignored
    }
  }
};
