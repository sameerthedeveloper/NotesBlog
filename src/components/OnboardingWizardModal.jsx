"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Check,
  FilePlus,
  Compass,
  Palette,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "create",
    icon: FilePlus,
    label: "Create your first note",
    action: "/note/new",
  },
  {
    id: "discover",
    icon: Compass,
    label: "See what others have shared",
    action: "/discover",
  },
  {
    id: "theme",
    icon: Palette,
    label: "Pick a light or dark theme",
    action: "theme",
  },
];

export default function OnboardingWizardModal() {
  const { onboardingOpen, completeOnboarding } = useAuth();
  const { toggleColorMode } = useAppTheme();
  const router = useRouter();

  const [doneSteps, setDoneSteps] = useState(() => new Set());
  const [collapsed, setCollapsed] = useState(false);

  if (!onboardingOpen) return null;

  const markDone = (id) => {
    setDoneSteps((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (next.size === STEPS.length) {
        completeOnboarding();
      }
      return next;
    });
  };

  const handleStepClick = (step) => {
    markDone(step.id);
    if (step.action === "theme") {
      toggleColorMode();
    } else {
      router.push(step.action);
    }
  };

  const doneCount = doneSteps.size;

  return (
    <div className="fixed right-4 bottom-4 z-50 w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-xl sm:right-6 sm:bottom-6">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-bold">Get started</p>
          <p className="text-xs text-muted-foreground">{doneCount} of {STEPS.length} done</p>
        </div>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? "Expand checklist" : "Collapse checklist"}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                {collapsed ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>{collapsed ? "Expand" : "Collapse"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={completeOnboarding}
                aria-label="Dismiss checklist"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Dismiss</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {!collapsed && (
        <div className="flex flex-col p-2">
          {STEPS.map((step) => {
            const done = doneSteps.has(step.id);
            const Icon = step.icon;
            return (
              <Button
                key={step.id}
                variant="ghost"
                onClick={() => handleStepClick(step)}
                className="h-auto justify-start gap-3 px-2 py-2 font-normal"
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border",
                    done ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                  )}
                >
                  {done ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
                </span>
                <span className={cn("text-sm", done ? "text-muted-foreground line-through" : "text-foreground")}>
                  {step.label}
                </span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
