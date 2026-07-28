import { db, auth } from "../../../firebase/config";
import { isSuperAdmin } from "../../../config/adminConfig";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Fetch creator monetization settings from Firestore
 */
export const getCreatorMonetization = async (uid) => {
  if (!uid) return null;
  try {
    const docRef = doc(db, "creatorMonetization", uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  } catch (error) {
    console.warn("Could not fetch creator monetization (using fallback):", error?.message || error);
  }
  // Default initial document format if none exists yet or permission denied
  return {
    uid,
    status: "not_connected", // 'not_connected' | 'pending' | 'verified' | 'rejected'
    activeProviderId: null,
    publisherId: "",
    publisherName: "",
    publisherEmail: "",
    placements: {
      above_article: true,
      below_article: true,
      inside_article: false,
      sidebar: true,
      home_feed: false,
      search_results: false,
      collections: false,
    },
    slotIds: {
      above_article: "",
      below_article: "",
      inside_article: "",
      sidebar: "",
    },
    settings: {
      adDensity: "medium", // 'low' | 'medium' | 'high'
      autoInjectAds: true,
      safeCategoriesOnly: true,
    },
    createdAt: null,
    updatedAt: null,
  };
};

/**
 * Save / update creator monetization configuration & submit for verification
 */
export const saveCreatorMonetization = async (uid, data) => {
  if (!uid) throw new Error("User ID is required.");
  try {
    const docRef = doc(db, "creatorMonetization", uid);
    const existing = await getCreatorMonetization(uid);

    const payload = {
      ...existing,
      ...data,
      uid,
      updatedAt: serverTimestamp(),
    };

    if (!existing.createdAt) {
      payload.createdAt = serverTimestamp();
    }

    await setDoc(docRef, payload, { merge: true });

    // Record verification entry if status changed to pending
    if (data.status === "pending") {
      const verifRef = doc(db, "providerVerifications", `${uid}_${data.activeProviderId || "provider"}`);
      await setDoc(verifRef, {
        uid,
        providerId: data.activeProviderId,
        publisherId: data.publisherId,
        publisherName: data.publisherName,
        publisherEmail: data.publisherEmail,
        status: "pending",
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        notes: "Submitted for platform review.",
      }, { merge: true });
    }

    return payload;
  } catch (error) {
    console.error("Error saving creator monetization:", error);
    throw error;
  }
};

/**
 * Save placement toggles & slot IDs
 */
export const updatePlacements = async (uid, placements, slotIds) => {
  if (!uid) throw new Error("User ID is required.");
  try {
    const docRef = doc(db, "creatorMonetization", uid);
    await updateDoc(docRef, {
      placements,
      slotIds,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating placements:", error);
    throw error;
  }
};

/**
 * Fetch creator ad analytics / earnings metrics
 */
export const getCreatorAnalytics = async () => {
  return {
    estimatedRevenue: "$0.00",
    todayEarnings: "$0.00",
    monthlyEarnings: "$0.00",
    impressions: 0,
    clicks: 0,
    ctr: "0.00%",
    rpm: "$0.00",
    chartData: [],
    topNotes: [],
  };
};

/**
 * Admin: Fetch all pending/all creator verification submissions
 */
export const getAllVerificationsAdmin = async () => {
  if (!isSuperAdmin(auth.currentUser)) {
    console.error("Unauthorized access attempt to getAllVerificationsAdmin");
    throw new Error("HTTP 403: Forbidden - Super Admin access required");
  }

  try {
    const q = query(collection(db, "providerVerifications"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching verifications:", error);
    return [];
  }
};

/**
 * Admin: Approve or Reject a creator verification request
 */
export const updateVerificationStatusAdmin = async (uid, providerId, newStatus, notes = "") => {
  if (!isSuperAdmin(auth.currentUser)) {
    console.error("Unauthorized access attempt to updateVerificationStatusAdmin");
    throw new Error("HTTP 403: Forbidden - Super Admin access required");
  }

  try {
    const verifRef = doc(db, "providerVerifications", `${uid}_${providerId}`);
    await updateDoc(verifRef, {
      status: newStatus,
      notes,
      updatedAt: serverTimestamp(),
      verifiedAt: newStatus === "verified" ? serverTimestamp() : null,
    });

    const creatorRef = doc(db, "creatorMonetization", uid);
    await updateDoc(creatorRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating verification status:", error);
    throw error;
  }
};
