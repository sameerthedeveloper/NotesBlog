import { Suspense } from "react";
import AuthLayout from "@/layouts/AuthLayout";
import FullscreenLoader from "@/components/FullscreenLoader";

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<FullscreenLoader />}>
      <AuthLayout>{children}</AuthLayout>
    </Suspense>
  );
}
