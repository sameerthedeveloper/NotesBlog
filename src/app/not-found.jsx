"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { StickyNote, Search, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { animateFloatLoop, animatePageEntrance } from "@/utils/animationManager";

export default function NotFound() {
  const noteRef = useRef(null);
  const magnifierRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    animateFloatLoop(noteRef.current, {
      duration: 3200,
      keyframes: [
        { transform: "translateY(0) rotate(-3deg)" },
        { transform: "translateY(-10px) rotate(3deg)" },
        { transform: "translateY(0) rotate(-3deg)" },
      ],
    });
    animateFloatLoop(magnifierRef.current, {
      duration: 4200,
      keyframes: [
        { transform: "translate(0, 0) rotate(0deg)" },
        { transform: "translate(6px, -4px) rotate(-8deg)" },
        { transform: "translate(-4px, 4px) rotate(6deg)" },
        { transform: "translate(0, 0) rotate(0deg)" },
      ],
    });
    animatePageEntrance(contentRef.current, { duration: 0.4 });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6 py-16 text-center">
      <div className="relative">
        <div
          ref={noteRef}
          className="flex size-32 items-center justify-center rounded-3xl border-2 border-dashed border-copper-300 bg-copper-50"
        >
          <StickyNote className="size-14 text-copper-500" strokeWidth={1.5} />
        </div>
        <div
          ref={magnifierRef}
          className="absolute -right-3 -bottom-3 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
        >
          <Search className="size-5" />
        </div>
      </div>

      <div ref={contentRef} className="max-w-md">
        <p className="mb-2 text-sm font-bold tracking-wide text-primary uppercase">
          404
        </p>
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          This note wandered off
        </h1>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist, or it may have
          been moved, renamed, or deleted.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/dashboard">
            Back to your notes
            <ArrowRight />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/">
            <Home />
            Go home
          </Link>
        </Button>
      </div>
    </div>
  );
}
