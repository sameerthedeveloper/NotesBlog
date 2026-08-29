"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Type,
  Search,
  Bookmark,
  Moon,
  FolderOpen,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import FullscreenLoader from "@/components/FullscreenLoader";

const FEATURES = [
  { icon: BookOpen, label: "Beautiful HTML Notes", desc: "Write stunning notes with rich formatting" },
  { icon: Type, label: "Rich Text Editor", desc: "TipTap-powered block editor experience" },
  { icon: FolderOpen, label: "Collections", desc: "Organize notes into themed collections" },
  { icon: Search, label: "Instant Search", desc: "Find anything across all your notes" },
  { icon: Bookmark, label: "Bookmarks", desc: "Save important notes for quick access" },
  { icon: Moon, label: "Dark Mode", desc: "Works beautifully in light and dark" },
];

const BrandPanel = () => (
  <div className="relative hidden min-h-screen w-[45%] shrink-0 flex-col justify-center overflow-hidden bg-[#18181b] p-10 lg:p-14 md:flex">
    <div className="pointer-events-none absolute -top-20 -right-20 size-85 rounded-full bg-[radial-gradient(circle,rgba(201,124,67,0.18)_0%,transparent_70%)]" />
    <div className="pointer-events-none absolute bottom-14 -left-16 size-55 rounded-full border-2 border-white/10" />

    <div className="relative z-10 flex flex-col gap-10">
      <div className="flex items-center gap-3">
        <Image
          src="/logo.svg"
          alt="OpenNotes"
          width={48}
          height={48}
          className="rounded-[14px] shadow-lg"
        />
        <span className="text-lg font-black tracking-tight text-white">
          OpenNotes
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-[2rem] leading-[1.15] font-black tracking-tight text-white lg:text-[2.5rem]">
          Organize Knowledge.
          <br />
          Share Ideas.
        </h1>
        <p className="max-w-85 text-sm leading-relaxed text-white/70">
          A modern workspace for creating, organizing, and collaborating on
          beautiful notes.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10">
              <Icon className="size-4.5 text-white" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-white">{label}</span>
              <span className="text-xs text-white/60">{desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5">
        <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(74,222,128,0.25)]" />
        <span className="text-xs font-bold text-white/85">
        
          Free forever · No credit card required
        </span>
      </div>
    </div>
  </div>
);

const FormPanel = ({ children }) => (
  <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-8 md:px-10 md:py-12 lg:px-16">
    <div className="pointer-events-none absolute -top-44 -right-44 size-120 rounded-full bg-[radial-gradient(circle,rgba(168,92,44,0.06)_0%,transparent_65%)]" />

    <div className="mb-8 flex items-center gap-2.5 md:hidden">
      <Image
        src="/logo.svg"
        alt="OpenNotes"
        width={40}
        height={40}
        className="rounded-xl"
      />
      <span className="text-lg font-black tracking-tight text-foreground">
        OpenNotes
      </span>
    </div>

    <div className="relative z-10 w-full max-w-105">{children}</div>

    <p className="relative z-10 mt-8 text-center text-xs font-medium text-muted-foreground">
      Protected by OpenNotes · By continuing, you agree to our{" "}
      <span className="cursor-pointer font-bold text-foreground/80 hover:text-foreground">
        Terms
      </span>{" "}
      &amp;{" "}
      <span className="cursor-pointer font-bold text-foreground/80 hover:text-foreground">
        Privacy Policy
      </span>
    </p>
  </div>
);

const AuthLayout = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  useEffect(() => {
    if (!loading && currentUser) {
      router.replace(from);
    }
  }, [loading, currentUser, from, router]);

  if (loading || currentUser) {
    return <FullscreenLoader />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <BrandPanel />
      <FormPanel>{children}</FormPanel>
    </div>
  );
};

export default AuthLayout;
