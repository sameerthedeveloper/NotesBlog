import { 
  db,
  storage,
  auth
} from "../../../firebase/config";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  onSnapshot,
  limit,
  increment,
  setDoc
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "firebase/storage";

const NOTES_COLLECTION = "notes";
const USERS_COLLECTION = "users";

// --- Users ---

export const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return;
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const { email, displayName, photoURL } = user;
    const createdAt = serverTimestamp();

    try {
      await setDoc(userRef, {
        displayName: displayName || email.split("@")[0],
        email,
        photoURL: photoURL || "",
        createdAt,
        updatedAt: createdAt,
        hasCompletedOnboarding: false,
        bio: "",
        role: "user",
        ...additionalData
      });
    } catch (error) {
      console.error("Error creating user profile", error);
    }
  }
  return getUserProfile(user.uid);
};

export const getUserProfile = async (uid) => {
  if (!uid) return null;
  const userRef = doc(db, USERS_COLLECTION, uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { uid: userSnap.id, ...userSnap.data() } : null;
};

export const updateUserProfile = async (uid, data) => {
  if (!uid) return;
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const updateOnboardingStatus = async (uid, completed = true) => {
  if (!uid) return;
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    hasCompletedOnboarding: completed,
    updatedAt: serverTimestamp()
  });
};

// --- Notes ---

export const createNote = async (userIdOrData, noteData) => {
  let uid;
  let data;

  if (typeof userIdOrData === "object" && userIdOrData !== null) {
    data = userIdOrData;
    uid = data.authorId || auth?.currentUser?.uid;
  } else {
    uid = userIdOrData || noteData?.authorId || auth?.currentUser?.uid;
    data = noteData || {};
  }

  if (!uid) {
    throw new Error("Authentication required to create a note.");
  }

  const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
    authorId: uid,
    title: data.title || "Untitled Note",
    content: data.content || "",
    isMigratedToHtml: true,
    tags: data.tags || [],
    visibility: data.visibility || "private",
    isPinned: data.isPinned || false,
    isFavorite: data.isFavorite || false,
    viewCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return docRef.id;
};

export const updateNote = async (noteId, noteData, options = {}) => {
  if (!noteId) throw new Error("Missing noteId for update");
  const docRef = doc(db, NOTES_COLLECTION, noteId);

  const updatePayload = {
    ...noteData,
    updatedAt: serverTimestamp()
  };

  if (options?.saveVersion) {
    try {
      const currentSnap = await getDoc(docRef);
      if (currentSnap.exists()) {
        const currentData = currentSnap.data();
        const existingVersions = currentData.versions || [];
        const newVersion = {
          title: currentData.title || "Untitled Note",
          content: currentData.content || "",
          timestamp: new Date().toISOString()
        };
        updatePayload.versions = [newVersion, ...existingVersions.filter(v => typeof v === "object")].slice(0, 10);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Non-critical: Version history backup omitted on update", err);
      }
    }
  }

  await updateDoc(docRef, updatePayload);
};

export const togglePin = async (noteId, isPinned, userId = null, noteData = null) => {
  const uid = userId || auth?.currentUser?.uid;
  if (!uid) throw new Error("Authentication required to pin notes.");

  const userPinRef = doc(db, USERS_COLLECTION, uid, "pins", noteId);
  if (isPinned) {
    const pinPayload = {
      noteId,
      isPinned: true,
      updatedAt: serverTimestamp(),
      ...(noteData ? {
        title: noteData.title || "Untitled Note",
        content: noteData.content || "",
        authorId: noteData.authorId || "",
        authorName: noteData.authorName || noteData.authorDisplayName || "Anonymous",
        visibility: noteData.visibility || "public",
        tags: noteData.tags || [],
      } : {})
    };
    await setDoc(userPinRef, pinPayload, { merge: true });
  } else {
    try {
      await deleteDoc(userPinRef);
    } catch {
      // Ignore if document didn't exist
    }
  }

  if (!noteData || noteData.authorId === uid) {
    try {
      const mainDocRef = doc(db, NOTES_COLLECTION, noteId);
      await updateDoc(mainDocRef, { isPinned });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Non-author pin stored locally in user profile", err);
      }
    }
  }
};

export const toggleFavorite = async (noteId, isFavorite, userId = null, noteData = null) => {
  const uid = userId || auth?.currentUser?.uid;
  if (!uid) throw new Error("Authentication required to bookmark notes.");

  const userBookmarkRef = doc(db, USERS_COLLECTION, uid, "bookmarks", noteId);
  if (isFavorite) {
    const bookmarkPayload = {
      noteId,
      isFavorite: true,
      updatedAt: serverTimestamp(),
      ...(noteData ? {
        title: noteData.title || "Untitled Note",
        content: noteData.content || "",
        authorId: noteData.authorId || "",
        authorName: noteData.authorName || noteData.authorDisplayName || "Anonymous",
        visibility: noteData.visibility || "public",
        tags: noteData.tags || [],
      } : {})
    };
    await setDoc(userBookmarkRef, bookmarkPayload, { merge: true });
  } else {
    try {
      await deleteDoc(userBookmarkRef);
    } catch {
      // Ignore if document didn't exist
    }
  }

  if (!noteData || noteData.authorId === uid) {
    try {
      const mainDocRef = doc(db, NOTES_COLLECTION, noteId);
      await updateDoc(mainDocRef, { isFavorite });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Non-author favorite stored locally in user profile", err);
      }
    }
  }
};

export const subscribeUserBookmarks = (userId, callback) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  const bookmarksRef = collection(db, USERS_COLLECTION, userId, "bookmarks");
  return onSnapshot(
    bookmarksRef,
    (snapshot) => {
      const bookmarks = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      callback(bookmarks);
    },
    (error) => {
      if (import.meta.env.DEV) {
        console.warn("subscribeUserBookmarks error:", error);
      }
      callback([]);
    }
  );
};

export const subscribeUserPins = (userId, callback) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  const pinsRef = collection(db, USERS_COLLECTION, userId, "pins");
  return onSnapshot(
    pinsRef,
    (snapshot) => {
      const pins = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      callback(pins);
    },
    (error) => {
      if (import.meta.env.DEV) {
        console.warn("subscribeUserPins error:", error);
      }
      callback([]);
    }
  );
};

export const incrementViewCount = async (noteId, viewerInfo = null) => {
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  
  await updateDoc(docRef, { viewCount: increment(1) });

  if (viewerInfo) {
    const viewerId = viewerInfo.uid || "guest_" + Date.now();
    const viewRef = doc(db, NOTES_COLLECTION, noteId, "views", viewerId);
    
    const viewData = {
      uid: viewerId,
      displayName: viewerInfo.displayName || "Guest Viewer",
      lastViewedAt: serverTimestamp(),
      viewCount: increment(1)
    };

    if (viewerInfo.email) viewData.email = viewerInfo.email;
    if (viewerInfo.photoURL) viewData.photoURL = viewerInfo.photoURL;

    await setDoc(viewRef, viewData, { merge: true });
  } else {
    const viewRef = doc(db, NOTES_COLLECTION, noteId, "views", "anon_" + Date.now());
    await setDoc(viewRef, {
      uid: "anonymous",
      displayName: "Anonymous Viewer",
      lastViewedAt: serverTimestamp()
    });
  }
};

export const subscribeNoteById = (noteId, callback) => {
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  return onSnapshot(
    docRef, 
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      if (import.meta.env.DEV) {
        console.warn("subscribeNoteById error:", error);
      }
      callback(null);
    }
  );
};

export const subscribeNoteViews = (noteId, callback) => {
  const viewsRef = collection(db, NOTES_COLLECTION, noteId, "views");
  const q = query(viewsRef, orderBy("lastViewedAt", "desc"), limit(100));
  
  return onSnapshot(
    q, 
    (snapshot) => {
      const views = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      callback(views);
    },
    (error) => {
      if (import.meta.env.DEV) {
        console.warn("subscribeNoteViews error:", error);
      }
      callback([]);
    }
  );
};

export const deleteNote = async (noteId) => {
  await deleteDoc(doc(db, NOTES_COLLECTION, noteId));
};

export const getNoteById = async (noteId) => {
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const subscribeUserNotes = (userId, options = {}, callback) => {
  const { sortField = "updatedAt", sortOrder = "desc", pageSize = 50 } = options;
  
  const q = query(
    collection(db, NOTES_COLLECTION),
    where("authorId", "==", userId),
    orderBy("isPinned", "desc"),
    orderBy(sortField, sortOrder),
    limit(pageSize)
  );
  
  return onSnapshot(
    q, 
    (snapshot) => {
      const notes = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      callback(notes);
    }, 
    (error) => {
      if (import.meta.env.DEV) {
        if (error.code === 'failed-precondition') {
          console.warn("Firestore Index Missing for user query");
        } else {
          console.warn("Firestore User Notes Error:", error);
        }
      }
      callback([]);
    }
  );
};

export const subscribePublicNotes = (callback) => {
  const q = query(
    collection(db, NOTES_COLLECTION),
    where("visibility", "==", "public"),
    orderBy("updatedAt", "desc")
  );
  
  return onSnapshot(
    q, 
    (snapshot) => {
      const notes = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      callback(notes);
    },
    (error) => {
      if (import.meta.env.DEV) {
        console.warn("subscribePublicNotes error:", error);
      }
      callback([]);
    }
  );
};

export const uploadFileAttachment = async (userId, file) => {
  if (!userId || !file) throw new Error("Missing required parameters: userId or file.");
  
  const uniqueName = Date.now() + '-' + file.name;
  const storageRef = ref(storage, `users/${userId}/attachments/${uniqueName}`);
  
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on(
      'state_changed',
      () => {},
      (error) => {
        console.error("Upload failed", error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadURL,
            filename: file.name,
            size: file.size,
            type: file.type
          });
        } catch (urlError) {
          reject(urlError);
        }
      }
    );
  });
};
