/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";

const defaultPlatformSettings = {
  general: {
    platformName: "OpenNotes",
    maintenanceMode: false,
    maintenanceMessage: "OpenNotes is currently undergoing scheduled maintenance. Please check back shortly.",
    registrationEnabled: true,
    guestAccess: true,
    siteAnnouncement: "",
  },
  advertisements: {
    enableAds: true,
    platformAds: true,
    creatorAds: true,
    adsenseEnabled: true,
    googleAdManager: true,
    autoAds: true,
    bannerAds: true,
    inArticleAds: true,
    sidebarAds: true,
    mobileAds: true,
    desktopAds: true,
  },
  creatorMonetization: {
    enableCreatorMonetization: true,
    allowPublisherIdSubmission: true,
    requireAdminApproval: true,
    minimumFollowers: 0,
    minimumViews: 0,
    minimumPublishedNotes: 0,
  },
  community: {
    comments: true,
    likes: true,
    bookmarks: true,
    followers: true,
  },
  ai: {
    enableAI: true,
    summaries: true,
    grammarCorrection: true,
    rewrite: true,
    translation: true,
    autoTags: true,
  },
  offline: {
    offlineMode: true,
    offlineEditing: true,
    offlineReading: true,
    backgroundSync: true,
  },
};

const PlatformSettingsContext = createContext({
  settings: defaultPlatformSettings,
  loading: true,
  updateSetting: async () => {},
});

export const PlatformSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultPlatformSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "platformSettings", "global");
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings((prev) => ({
            ...prev,
            ...docSnap.data(),
          }));
        } else {
          // Initialize document with defaults if missing
          setDoc(docRef, { ...defaultPlatformSettings, updatedAt: serverTimestamp() }).catch(() => {});
        }
        setLoading(false);
      },
      (error) => {
        console.warn("PlatformSettings listener error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateSetting = async (section, key, value) => {
    const updated = {
      ...settings,
      [section]: {
        ...(settings[section] || {}),
        [key]: value,
      },
      updatedAt: serverTimestamp(),
    };

    setSettings(updated);
    const docRef = doc(db, "platformSettings", "global");
    await setDoc(docRef, updated, { merge: true });
  };

  return (
    <PlatformSettingsContext.Provider value={{ settings, loading, updateSetting }}>
      {children}
    </PlatformSettingsContext.Provider>
  );
};

export const usePlatformSettings = () => useContext(PlatformSettingsContext);
