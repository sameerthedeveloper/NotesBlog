"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FullscreenLoader from "@/components/FullscreenLoader";

export default function ProtectedGuard({ children }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading && !currentUser) {
      const from = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
      router.replace(`/login?from=${encodeURIComponent(from)}`);
    }
  }, [loading, currentUser, pathname, searchParams, router]);

  if (loading || !currentUser) {
    return <FullscreenLoader />;
  }

  return children;
}
