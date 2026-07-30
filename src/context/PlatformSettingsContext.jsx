/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";

const CACHE_KEY = "opennotes_platform_settings_v1";

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
  discussions: {
    enableDiscussions: true,
    allowGuestReading: true,
    threadedReplies: true,
    maxDepth: 10,
  },
};

const getInitialSettings = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        ...defaultPlatformSettings,
        ...parsed,
        general: { ...defaultPlatformSettings.general, ...(parsed.general || {}) },
        advertisements: { ...defaultPlatformSettings.advertisements, ...(parsed.advertisements || {}) },
        creatorMonetization: { ...defaultPlatformSettings.creatorMonetization, ...(parsed.creatorMonetization || {}) },
        community: { ...defaultPlatformSettings.community, ...(parsed.community || {}) },
        ai: { ...defaultPlatformSettings.ai, ...(parsed.ai || {}) },
        offline: { ...defaultPlatformSettings.offline, ...(parsed.offline || {}) },
        discussions: { ...defaultPlatformSettings.discussions, ...(parsed.discussions || {}) },
      };
    }
  } catch {
    // Ignore cache parsing errors
  }
  return defaultPlatformSettings;
};

const PlatformSettingsContext = createContext({
  settings: defaultPlatformSettings,
  loading: true,
  updateSetting: async () => {},
});

export const PlatformSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(getInitialSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      const docRef = doc(db, "platformSettings", "global");
      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSettings((prev) => {
              const updated = { ...prev, ...data };
              try {
                localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
              } catch {
                // Ignore storage errors
              }
              return updated;
            });
          }
          setLoading(false);
        },
        (error) => {
          if (import.meta.env.DEV) {
            console.warn("PlatformSettings listener caught non-fatal error:", error);
          }
          setLoading(false);
        }
      );
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("Failed to initialize PlatformSettings listener:", err);
      }
      setLoading(false);
    }

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
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
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }

    try {
      const docRef = doc(db, "platformSettings", "global");
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("PlatformSettings update error:", err);
      }
    }
  };

  return (
    <PlatformSettingsContext.Provider value={{ settings, loading, updateSetting }}>
      {children}
    </PlatformSettingsContext.Provider>
  );
};

export const usePlatformSettings = () => useContext(PlatformSettingsContext);

