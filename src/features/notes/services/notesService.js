import { 
  db,
  storage
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

export const createUserProfile = async (uid, userData) => {
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    ...userData,
    updatedAt: serverTimestamp()
  });
};

export const getUserProfile = async (uid) => {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
  return userDoc.exists() ? userDoc.data() : null;
};

// --- Notes ---

export const createNote = async (noteData) => {
  const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
    ...noteData,
    isPinned: false,
    isFavorite: false,
    viewCount: 0,
    versions: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateNote = async (noteId, noteData, options = {}) => {
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  
  if (options.saveVersion && noteData.content) {
    const noteSnap = await getDoc(docRef);
    const oldContent = noteSnap.data()?.content;
    if (oldContent && oldContent !== noteData.content) {
      const currentVersions = noteSnap.data()?.versions || [];
      const newVersions = [oldContent, ...currentVersions].slice(0, 3);
      noteData.versions = newVersions;
    }
  }

  await updateDoc(docRef, {
    ...noteData,
    updatedAt: serverTimestamp()
  });
};

export const togglePin = async (noteId, isPinned) => {
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  await updateDoc(docRef, { isPinned });
};

export const toggleFavorite = async (noteId, isFavorite) => {
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  await updateDoc(docRef, { isFavorite });
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
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  });
};

export const subscribeNoteViews = (noteId, callback) => {
  const viewsRef = collection(db, NOTES_COLLECTION, noteId, "views");
  const q = query(viewsRef, orderBy("lastViewedAt", "desc"), limit(100));
  
  return onSnapshot(q, (snapshot) => {
    const views = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    callback(views);
  });
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
  
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    callback(notes);
  }, (error) => {
    if (error.code === 'failed-precondition') {
      console.error("Firestore Index Missing for user query");
    } else {
      console.error("Firestore Error:", error);
    }
  });
};

export const subscribePublicNotes = (callback) => {
  const q = query(
    collection(db, NOTES_COLLECTION),
    where("visibility", "==", "public"),
    orderBy("updatedAt", "desc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    callback(notes);
  });
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
