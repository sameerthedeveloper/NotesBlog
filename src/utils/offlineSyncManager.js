import { useState, useEffect } from "react";
import toast from "react-hot-toast";

/**
 * React hook to listen for online / offline connectivity changes.
 * Provides isOnline status and automatic sync notifications.
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online! Offline changes are syncing with Firebase...", {
        icon: "⚡",
        duration: 4000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast("Working offline. All notes & edits are saved locally.", {
        icon: "📡",
        duration: 5000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline };
};

export default useNetworkStatus;
