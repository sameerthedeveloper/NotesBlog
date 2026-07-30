import { db, auth } from "../../../firebase/config";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit
} from "firebase/firestore";

const CHAT_ROOMS_COLLECTION = "chatRooms";
const CHAT_MESSAGES_COLLECTION = "chatMessages";
const DISCUSSION_TOPICS_COLLECTION = "discussionTopics";

export const DEFAULT_CHAT_ROOMS = [
  { id: "global-lobby", name: "global-lobby", description: "Global Student & Learner Community Lounge", category: "Public" },
  { id: "computer-science", name: "computer-science", description: "Algorithms, Software Engineering & Tech Notes", category: "Subjects" },
  { id: "study-lounge", name: "study-lounge", description: "Homework Help, Group Study & Quiz Prep", category: "Study" },
  { id: "ai-learning", name: "ai-learning", description: "Machine Learning, Prompting & AI Tools", category: "Tech" },
  { id: "code-help", name: "code-help", description: "Live Code Debugging & Web Development", category: "Subjects" }
];

/**
 * Real-time listener for public chat rooms.
 */
export const subscribeChatRooms = (callback) => {
  const q = query(collection(db, CHAT_ROOMS_COLLECTION), orderBy("name", "asc"));
  
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(DEFAULT_CHAT_ROOMS);
      } else {
        const rooms = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        // Merge defaults if missing
        const existingIds = new Set(rooms.map((r) => r.id));
        const merged = [...rooms];
        DEFAULT_CHAT_ROOMS.forEach((def) => {
          if (!existingIds.has(def.id)) merged.push(def);
        });
        callback(merged);
      }
    },
    (error) => {
      if (import.meta.env.DEV) {
        console.warn("subscribeChatRooms error:", error);
      }
      callback(DEFAULT_CHAT_ROOMS);
    }
  );
};

/**
 * Real-time listener for chat messages in a specific channel.
 */
export const subscribeChatMessages = (roomId, callback) => {
  if (!roomId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, CHAT_MESSAGES_COLLECTION),
    where("roomId", "==", roomId),
    orderBy("createdAt", "asc"),
    limit(150)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      callback(messages);
    },
    (error) => {
      if (import.meta.env.DEV) {
        console.warn("subscribeChatMessages error:", error);
      }
      callback([]);
    }
  );
};

/**
 * Send a message to a live chat room.
 */
export const sendChatMessage = async (roomId, text, codeSnippet = "", userProfile = null) => {
  const currentUserId = auth.currentUser?.uid;
  if (!currentUserId) throw new Error("Authentication required to send chat messages.");

  const payload = {
    roomId,
    authorId: currentUserId,
    authorName: userProfile?.displayName || userProfile?.name || auth.currentUser.displayName || "Anonymous",
    authorPhoto: userProfile?.photoURL || auth.currentUser.photoURL || "",
    text: text.trim(),
    codeSnippet: codeSnippet.trim(),
    createdAt: serverTimestamp()
  };

  return await addDoc(collection(db, CHAT_MESSAGES_COLLECTION), payload);
};

/**
 * Delete a message from chat room.
 */
export const deleteChatMessage = async (messageId) => {
  await deleteDoc(doc(db, CHAT_MESSAGES_COLLECTION, messageId));
};

/**
 * Real-time listener for global community discussion topics across all categories.
 */
export const subscribeGlobalForums = (category = "all", callback) => {
  let q;
  if (category && category !== "all") {
    q = query(
      collection(db, DISCUSSION_TOPICS_COLLECTION),
      where("category", "==", category),
      orderBy("updatedAt", "desc"),
      limit(100)
    );
  } else {
    q = query(
      collection(db, DISCUSSION_TOPICS_COLLECTION),
      orderBy("updatedAt", "desc"),
      limit(100)
    );
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const topics = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      callback(topics);
    },
    (error) => {
      if (import.meta.env.DEV) {
        console.warn("subscribeGlobalForums error:", error);
      }
      callback([]);
    }
  );
};
