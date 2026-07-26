/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { getCreatorMonetization, saveCreatorMonetization, updatePlacements } from "../features/monetization/services/monetizationService";
import { getProviderById } from "../features/monetization/providers";

const MonetizationContext = createContext();

export const useMonetization = () => useContext(MonetizationContext);

export const MonetizationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [monetizationState, setMonetizationState] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMonetization = useCallback(async () => {
    if (!currentUser) {
      setMonetizationState(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getCreatorMonetization(currentUser.uid);
      setMonetizationState(data);
    } catch (err) {
      console.error("Failed to load monetization:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchMonetization();
  }, [fetchMonetization]);

  const activeProvider = monetizationState?.activeProviderId
    ? getProviderById(monetizationState.activeProviderId)
    : null;

  const submitProviderConnection = async (providerId, config) => {
    if (!currentUser) return;
    const updated = await saveCreatorMonetization(currentUser.uid, {
      activeProviderId: providerId,
      publisherId: config.publisherId,
      publisherName: config.publisherName,
      publisherEmail: config.publisherEmail,
      status: "pending",
    });
    setMonetizationState(updated);
    return updated;
  };

  const savePlacementSettings = async (placements, slotIds) => {
    if (!currentUser) return;
    await updatePlacements(currentUser.uid, placements, slotIds);
    setMonetizationState((prev) => ({
      ...prev,
      placements,
      slotIds,
    }));
  };

  const value = {
    monetizationState,
    activeProvider,
    loading,
    refresh: fetchMonetization,
    submitProviderConnection,
    savePlacementSettings,
    status: monetizationState?.status || "not_connected",
    isVerified: monetizationState?.status === "verified",
  };

  return (
    <MonetizationContext.Provider value={value}>
      {children}
    </MonetizationContext.Provider>
  );
};
