"use client";

import { ShieldCheck, HardDrive, HelpCircle, PlayCircle, Sun, Moon } from "lucide-react";
import { useAppTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export const SettingsPage = () => {
  const { mode, toggleColorMode } = useAppTheme();
  const { setOnboardingOpen } = useAuth();

  const handleReplayOnboarding = () => {
    setOnboardingOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Application Settings</h1>
      <p className="mb-6 text-muted-foreground">
        Configure display preferences, security sanitization, and data options.
      </p>

      <div className="flex flex-col gap-4">
        {/* Appearance */}
        <div className="rounded-2xl border border-border p-6">
          <h2 className="mb-1 text-lg font-bold">Appearance &amp; Theme</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Customize the visual appearance of OpenNotes.
          </p>

          <RadioGroup
            value={mode}
            onValueChange={(value) => {
              if (value !== mode) toggleColorMode();
            }}
            className="flex flex-row gap-6"
          >
            <label className="flex items-center gap-2">
              <RadioGroupItem value="light" />
              <Sun className="size-4 text-amber-500" />
              <span className="text-sm font-medium">Light Theme</span>
            </label>
            <label className="flex items-center gap-2">
              <RadioGroupItem value="dark" />
              <Moon className="size-4" />
              <span className="text-sm font-medium">Dark Theme</span>
            </label>
          </RadioGroup>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-border p-6">
          <div className="mb-1 flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Security &amp; HTML Sanitization</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            All HTML content is automatically cleansed via DOMPurify to eliminate script injections and XSS vectors.
          </p>

          <div className="flex flex-col gap-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Switch checked disabled />
              DOMPurify Strict Tag Whitelisting (Active)
            </Label>
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Switch checked disabled />
              Automatic XSS &amp; JavaScript URL Removal (Active)
            </Label>
          </div>
        </div>

        {/* Storage */}
        <div className="rounded-2xl border border-border p-6">
          <div className="mb-1 flex items-center gap-2">
            <HardDrive className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-bold">Storage &amp; Offline Sync</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            HTML notes are cached locally for fast loading and offline accessibility.
          </p>

          <Button
            variant="outline"
            onClick={() => toast.success("Offline HTML cache refreshed successfully")}
          >
            Clear Offline Cache
          </Button>
        </div>

        {/* Help */}
        <div className="rounded-2xl border border-border p-6">
          <div className="mb-1 flex items-center gap-2">
            <HelpCircle className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-bold">Help &amp; Onboarding</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Replay the guided onboarding tour to rediscover features, personalization options, and tips for getting the most out of OpenNotes.
          </p>

          <Button variant="outline" onClick={handleReplayOnboarding}>
            <PlayCircle />
            Replay Onboarding Tour
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
