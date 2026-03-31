import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthChange, 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  logOut 
} from "../features/auth/services/authService";
import { getUserProfile } from "../features/notes/services/notesService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = (email, password, displayName) => {
    return signUpWithEmail(email, password, displayName);
  };

  const login = (email, password) => {
    return signInWithEmail(email, password);
  };

  const loginWithGoogle = () => {
    return signInWithGoogle();
  };

  const logout = () => {
    return logOut();
  };

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
