import { 
  auth, 
  googleProvider 
} from "../../../firebase/config";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/config";

export const signUpWithEmail = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  await updateProfile(user, { displayName });
  
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name: displayName,
    email: user.email,
    avatar: user.photoURL || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return user;
};

export const signInWithEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  
  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      avatar: user.photoURL || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  
  return user;
};

export const logOut = async () => {
  await signOut(auth);
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
