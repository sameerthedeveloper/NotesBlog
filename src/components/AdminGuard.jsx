"use client";

import { useAuth } from "@/context/AuthContext";
import { isSuperAdmin } from "@/config/adminConfig";
import UnauthorizedPage from "@/components/UnauthorizedPage";
import FullscreenLoader from "@/components/FullscreenLoader";

export default function AdminGuard({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <FullscreenLoader />;
  }

  // ProtectedGuard (parent layout) handles the unauthenticated redirect.
  if (!currentUser) {
    return <FullscreenLoader />;
  }

  if (!isSuperAdmin(currentUser)) {
    return <UnauthorizedPage />;
  }

  return children;
}
