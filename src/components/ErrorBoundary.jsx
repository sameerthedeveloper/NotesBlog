"use client";

import React from "react";
import { CircleAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center text-center">
          <div className="rounded-lg border border-border bg-card p-12">
            <CircleAlert className="mx-auto mb-6 size-16 text-destructive" />
            <h1 className="text-2xl font-extrabold text-foreground">
              Something went wrong
            </h1>
            <p className="mt-2 mb-8 text-muted-foreground">
              An unexpected error occurred. Don&apos;t worry, your data is safe.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button size="lg" onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button size="lg" variant="outline" asChild>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a hard navigation is intentional when recovering from a crash */}
                <a href="/">
                  <Home />
                  Go Home
                </a>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
