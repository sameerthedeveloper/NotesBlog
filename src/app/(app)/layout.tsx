import { Suspense } from "react";
import ProtectedGuard from "@/components/ProtectedGuard";
import AppLayout from "@/layouts/AppLayout";
import FullscreenLoader from "@/components/FullscreenLoader";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<FullscreenLoader />}>
      <ProtectedGuard>
        <AppLayout>{children}</AppLayout>
      </ProtectedGuard>
    </Suspense>
  );
}
