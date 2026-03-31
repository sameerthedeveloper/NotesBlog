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
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  onSnapshot,
  limit,
  startAfter,
  increment
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
  try {
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
  } catch (error) {
    throw error;
  }
};

export const updateNote = async (noteId, noteData, options = {}) => {
  try {
    const docRef = doc(db, NOTES_COLLECTION, noteId);
    
    // Handle version history if requested
    if (options.saveVersion && noteData.content) {
      const noteSnap = await getDoc(docRef);
      const oldContent = noteSnap.data()?.content;
      if (oldContent && oldContent !== noteData.content) {
        // Keep last 3 versions
        const currentVersions = noteSnap.data()?.versions || [];
        const newVersions = [oldContent, ...currentVersions].slice(0, 3);
        noteData.versions = newVersions;
      }
    }

    await updateDoc(docRef, {
      ...noteData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    throw error;
  }
};

export const togglePin = async (noteId, isPinned) => {
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  await updateDoc(docRef, { isPinned });
};

export const toggleFavorite = async (noteId, isFavorite) => {
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  await updateDoc(docRef, { isFavorite });
};

export const incrementViewCount = async (noteId) => {
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  await updateDoc(docRef, { viewCount: increment(1) });
};

export const deleteNote = async (noteId) => {
  try {
    await deleteDoc(doc(db, NOTES_COLLECTION, noteId));
  } catch (error) {
    throw error;
  }
};

export const getNoteById = async (noteId) => {
  try {
    const docRef = doc(db, NOTES_COLLECTION, noteId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    throw error;
  }
};

export const subscribeUserNotes = (userId, options = {}, callback) => {
  const { sortField = "updatedAt", sortOrder = "desc", pageSize = 50 } = options;
  
  // Sort by Pinned first, then by the requested field
  const q = query(
    collection(db, NOTES_COLLECTION),
    where("authorId", "==", userId),
    orderBy("isPinned", "desc"),
    orderBy(sortField, sortOrder),
    limit(pageSize)
  );
  
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(notes);
  }, (error) => {
    if (error.code === 'failed-precondition') {
      console.error("Firestore Index Missing: This query requires a composite index. Create it here: https://console.firebase.google.com/v1/r/project/notespot-e1481/firestore/indexes");
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
    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(notes);
  }, (error) => {
  });
};

export const uploadFileAttachment = async (userId, file) => {
  if (!userId || !file) throw new Error("Missing required parameters: userId or file.");
  
  // Create a unique file name to avoid collisions
  const uniqueName = Date.now() + '-' + file.name;
  const storageRef = ref(storage, `users/${userId}/attachments/${uniqueName}`);
  
  // Return a promise that resolves when the upload completes
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // We could track progress here if needed
      },
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

