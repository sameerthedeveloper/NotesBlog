"use client";

import { ShieldAlert, Home, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const UnauthorizedPage = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
        <div className="mx-auto mb-6 inline-flex size-20 items-center justify-center rounded-full border-2 border-destructive/30 bg-destructive/10 text-destructive">
          <ShieldAlert size={42} />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          403 &ndash; Access Denied
        </h1>

        <p className="mt-3 mb-6 leading-relaxed text-muted-foreground">
          You do not have administrative permissions to view this section.
          Access is strictly restricted to authorized Super Administrators.
        </p>

        <div className="mb-8 flex items-center justify-center gap-2.5 rounded-lg bg-muted p-3">
          <Lock size={18} className="opacity-70" />
          <span className="text-xs font-medium text-muted-foreground">
            Security Policy Enforced: Super Admin Email Validation
          </span>
        </div>

        <Button size="lg" onClick={() => router.push("/dashboard")}>
          <Home size={18} />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
