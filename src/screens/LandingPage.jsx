"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  PenLine,
  ShieldCheck,
  CloudCheck,
  Share2,
  LayoutGrid,
  Zap,
  ArrowRight,
  LayoutDashboard,
  Notebook,
  Compass,
  Bookmark,
  Globe,
  Pin,
  StickyNote,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  animateDoodleEntrance,
  initScrollParallax,
  prefersReducedMotion,
} from "@/utils/animationManager";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: PenLine,
    title: "TipTap Rich Text Editor",
    description:
      "Complete formatting toolbar with support for headings, tables, task lists, code blocks, images, and embedded video.",
  },
  {
    icon: ShieldCheck,
    title: "DOMPurify XSS Protection",
    description:
      "Strict HTML sanitization ensures your shared notes remain secure, removing malicious scripts and unsafe tags.",
  },
  {
    icon: CloudCheck,
    title: "Real-Time Cloud Sync",
    description:
      "Instant Firestore synchronization with auto-save and continuous viewer tracking.",
  },
  {
    icon: Share2,
    title: "Seamless Sharing & Export",
    description:
      "Share notes via public links or export notes to PDF, DOCX (Word), HTML, and direct Print.",
  },
  {
    icon: LayoutGrid,
    title: "Minimalist Interface",
    description:
      "A clean, editorial reading and writing experience with light/dark mode built in.",
  },
  {
    icon: Zap,
    title: "HTML Search & Highlighting",
    description:
      "Search deep inside raw HTML content with automated match highlighting and tag filters.",
  },
];

export const LandingPage = () => {
  const { currentUser } = useAuth();
  const doodleRefs = useRef([]);
  const [underlineDrawn, setUnderlineDrawn] = useState(() => prefersReducedMotion());

  useEffect(() => {
    const doodles = doodleRefs.current.filter(Boolean);
    animateDoodleEntrance(doodles, { delay: 250, stagger: 0.12 });
    const cleanupParallax = initScrollParallax(doodles, { distance: 16 });

    if (prefersReducedMotion()) return cleanupParallax;

    const timer = setTimeout(() => setUnderlineDrawn(true), 650);
    return () => {
      clearTimeout(timer);
      cleanupParallax();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_50%_30%,rgba(168,92,44,0.08)_0%,transparent_70%)] py-16 text-center md:py-28">
        {/* Contextual floating doodles — note-taking themed, low-opacity, trail toward the margins */}
        <PenLine
          ref={(el) => (doodleRefs.current[0] = el)}
          className="pointer-events-none absolute top-16 left-[8%] hidden size-8 -rotate-12 text-copper-300 opacity-0 md:block lg:left-[14%]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <StickyNote
          ref={(el) => (doodleRefs.current[1] = el)}
          className="pointer-events-none absolute top-32 right-[6%] hidden size-9 rotate-6 text-copper-400 opacity-0 md:block lg:right-[12%]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <CheckCircle2
          ref={(el) => (doodleRefs.current[2] = el)}
          className="pointer-events-none absolute bottom-8 left-[12%] hidden size-6 text-copper-300 opacity-0 lg:block"
          strokeWidth={1.5}
          aria-hidden="true"
        />

        <div className="mx-auto max-w-3xl px-4">
          <span className="mb-6 inline-block rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">
            Version 2.0 Modernization Released
          </span>

          <h1 className="mb-6 text-4xl leading-[1.15] font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Create, Collaborate &amp; Share Notes{" "}
            <span className="relative inline-block">
              Effortlessly
              <span
                className={cn(
                  "absolute -bottom-1 left-0 h-1 w-full origin-left rounded-full bg-copper-300 transition-transform duration-500 ease-out",
                  underlineDrawn ? "scale-x-100" : "scale-x-0"
                )}
                aria-hidden="true"
              />
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-175 text-lg leading-relaxed text-muted-foreground">
            Upgrade your workflow with secure HTML-based rich text note
            taking, automated Markdown migration, real-time viewer tracking,
            and export options.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {currentUser ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Real product UI preview, not a stock icon grid */}
        <div className="mx-auto mt-14 max-w-4xl px-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-muted-foreground/20" />
              <span className="size-2.5 rounded-full bg-muted-foreground/20" />
              <span className="size-2.5 rounded-full bg-muted-foreground/20" />
              <span className="ml-3 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                opennotes.app/dashboard
              </span>
            </div>
            <div className="flex text-left">
              <div className="hidden w-44 shrink-0 flex-col gap-1 border-r border-border p-3 sm:flex">
                {[
                  { icon: LayoutDashboard, label: "Dashboard", active: true },
                  { icon: Notebook, label: "My Notes" },
                  { icon: Compass, label: "Discover" },
                  { icon: Bookmark, label: "Bookmarks" },
                ].map(({ icon: Icon, label, active }) => (
                  <div
                    key={label}
                    className={
                      active
                        ? "flex items-center gap-2 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary"
                        : "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground"
                    }
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </div>
                ))}
              </div>
              <div className="grid flex-1 grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                {[
                  { title: "Theory of Computation", tag: "TOC", pinned: true },
                  { title: "A* Search Algorithm", tag: "AI", pinned: false },
                ].map(({ title, tag, pinned }) => (
                  <Card key={title} className="rounded-xl py-0">
                    <CardContent className="flex flex-col gap-2 p-3.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold">{title}</p>
                        {pinned ? (
                          <Pin className="size-3.5 text-primary" />
                        ) : (
                          <Globe className="size-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted" />
                      <div className="h-1.5 w-2/3 rounded-full bg-muted" />
                      <Badge variant="outline" className="w-fit rounded-md text-[10px]">
                        #{tag}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <h2 className="mb-2 text-center text-3xl font-extrabold tracking-tight">
          Everything You Need in a Note Platform
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-muted-foreground">
          Designed with state-of-the-art security, performance, and
          accessibility.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="h-full rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
            >
              <CardContent>
                <Icon className="mb-3 size-6 text-muted-foreground" />
                <h3 className="mb-1.5 text-base font-bold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
