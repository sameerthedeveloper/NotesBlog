"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthChange, 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  logOut 
} from "../features/auth/services/authService";
import { getUserProfile, updateOnboardingStatus } from "../features/notes/services/notesService";

import { isSuperAdmin } from "../config/adminConfig";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        // Auto-trigger onboarding for new users who haven't completed it
        if (profile && profile.hasCompletedOnboarding === false) {
          setOnboardingOpen(true);
        } else if (profile && profile.hasCompletedOnboarding === undefined) {
          // Legacy users: treat undefined as not completed
          setOnboardingOpen(true);
        }
      } else {
        setUserProfile(null);
        setOnboardingOpen(false);
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

  const completeOnboarding = async () => {
    if (currentUser) {
      await updateOnboardingStatus(currentUser.uid, true);
      // Update local profile state too
      setUserProfile((prev) => prev ? { ...prev, hasCompletedOnboarding: true } : prev);
    }
    setOnboardingOpen(false);
  };

  const isAdmin = isSuperAdmin(currentUser);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    loginWithGoogle,
    logout,
    loading,
    isAdmin,
    isSuperAdmin: () => isSuperAdmin(currentUser),
    onboardingOpen,
    setOnboardingOpen,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
