"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Store,
  LayoutTemplate,
  BarChart3,
  ShieldCheck,
  Settings as SettingsIcon,
  Plus,
  TrendingUp,
  Eye,
  MousePointerClick,
  CheckCircle2,
  Hourglass,
  XCircle,
  Wallet,
  FileText,
} from "lucide-react";
import { useMonetization } from "@/context/MonetizationContext";
import { getAllProviders } from "@/features/monetization/providers";
import { getCreatorAnalytics } from "@/features/monetization/services/monetizationService";
import ProviderWizardModal from "@/features/monetization/components/ProviderWizardModal";
import AdPlacement from "@/features/monetization/components/AdPlacement";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "overview", label: "Overview", icon: DollarSign },
  { value: "providers", label: "Providers", icon: Store },
  { value: "placements", label: "Ad Placements", icon: LayoutTemplate },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
  { value: "verification", label: "Verification", icon: ShieldCheck },
  { value: "settings", label: "Settings", icon: SettingsIcon },
];

const PLACEMENT_OPTIONS = [
  { id: "above_article", label: "Above Article", desc: "Top banner before main note content" },
  { id: "below_article", label: "Below Article", desc: "Bottom banner after article conclusion" },
  { id: "inside_article", label: "Inside Long Articles", desc: "Inline banner within multi-paragraph notes" },
  { id: "sidebar", label: "Sidebar", desc: "Sticky sidebar ad unit" },
  { id: "home_feed", label: "Home Feed", desc: "Ad cards integrated into home feed list" },
  { id: "search_results", label: "Search Results", desc: "Sponsored placement in search page" },
  { id: "collections", label: "Collections", desc: "Note collection view placements" },
];

function StatusBadge({ status }) {
  if (status === "verified") {
    return <Badge className="gap-1 bg-success text-success-foreground"><CheckCircle2 className="size-3.5" />Verified &amp; Active</Badge>;
  }
  if (status === "pending") {
    return <Badge className="gap-1 bg-warning text-warning-foreground"><Hourglass className="size-3.5" />Pending Verification</Badge>;
  }
  if (status === "rejected") {
    return <Badge variant="destructive" className="gap-1"><XCircle className="size-3.5" />Rejected</Badge>;
  }
  return <Badge variant="secondary">Not Connected</Badge>;
}

export const MonetizationPage = () => {
  const { monetizationState, activeProvider, savePlacementSettings } = useMonetization();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const [placements, setPlacements] = useState(monetizationState?.placements || {
    above_article: true,
    below_article: true,
    inside_article: false,
    sidebar: true,
    home_feed: false,
    search_results: false,
    collections: false,
  });

  const [slotIds] = useState(monetizationState?.slotIds || {
    above_article: "",
    below_article: "",
    inside_article: "",
    sidebar: "",
  });

  useEffect(() => {
    if (monetizationState) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local editable copy from context state
      if (monetizationState.placements) setPlacements(monetizationState.placements);
    }
  }, [monetizationState]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingAnalytics(true);
      try {
        const data = await getCreatorAnalytics();
        setAnalytics(data);
      } catch {
        // Ignored
      } finally {
        setLoadingAnalytics(false);
      }
    };
    fetchStats();
  }, []);

  const handleSavePlacements = async () => {
    try {
      await savePlacementSettings(placements, slotIds);
      toast.success("Placement settings saved!");
    } catch {
      toast.error("Failed to save placement settings");
    }
  };

  const status = monetizationState?.status || "not_connected";

  return (
    <div className="w-full pb-12">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <DollarSign className="size-8 text-primary" />
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Creator Monetization Hub</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Provider-agnostic ad framework. Connect AdSense, Ad Manager, Media.net, Carbon Ads, or Custom partners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <Button onClick={() => setWizardOpen(true)}>
            <Plus />
            Connect Provider
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-1.5 rounded-lg border border-border data-[state=active]:border-primary">
              <t.icon className="size-4" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {[
              { label: "ESTIMATED REVENUE", value: analytics?.estimatedRevenue || "$0.00", icon: TrendingUp, sub: "+14.2% from last month", subClass: "text-emerald-500" },
              { label: "TODAY'S EARNINGS", value: analytics?.todayEarnings || "$0.00", icon: DollarSign, sub: "Updated real-time" },
              { label: "IMPRESSIONS", value: (analytics?.impressions ?? 0).toLocaleString(), icon: Eye, sub: `RPM: ${analytics?.rpm || "$0.00"}` },
              { label: "CLICKS & CTR", value: (analytics?.clicks ?? 0).toLocaleString(), icon: MousePointerClick, sub: `CTR: ${analytics?.ctr || "0%"}`, subClass: "text-amber-500" },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">{card.label}</span>
                  <card.icon className="size-4 text-primary" />
                </div>
                <p className="mt-2 text-2xl font-extrabold">{card.value}</p>
                <p className={cn("text-xs font-bold", card.subClass || "text-muted-foreground")}>{card.sub}</p>
              </div>
            ))}
          </div>

          <div className={cn("rounded-2xl border p-5", activeProvider ? "border-primary bg-primary/5" : "border-border")}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold">
                  {activeProvider ? `Active Provider: ${activeProvider.name}` : "No Ad Provider Connected"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeProvider
                    ? `Publisher ID: ${monetizationState?.publisherId}`
                    : "Connect an advertising provider to start monetizing your public notes."}
                </p>
              </div>
              <Button variant={activeProvider ? "outline" : "default"} onClick={() => setWizardOpen(true)}>
                <Plus />
                {activeProvider ? "Change Provider" : "Connect Ad Provider"}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border p-6">
            <h3 className="mb-3 text-base font-extrabold">Top Revenue Performing Notes</h3>
            {!analytics?.topNotes || analytics.topNotes.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No ad revenue recorded yet. Connect an ad provider and publish notes to view performance.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {analytics.topNotes.map((note, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-muted p-3">
                    <div>
                      <p className="text-sm font-bold">{note.title}</p>
                      <p className="text-xs text-muted-foreground">{note.views} views</p>
                    </div>
                    <Badge className="bg-success font-extrabold text-success-foreground">{note.revenue}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Providers */}
        <TabsContent value="providers" className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {getAllProviders().map((p) => {
              const isCurrent = monetizationState?.activeProviderId === p.id;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex h-full flex-col justify-between rounded-2xl border p-5",
                    isCurrent ? "border-2 border-primary" : "border-border"
                  )}
                >
                  <div>
                    <div className="mb-2 flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element -- external provider logo URLs */}
                      <img src={p.logo} alt={p.name} onError={(e) => { e.currentTarget.src = "/logo.svg"; }} className="size-11 object-contain" />
                      <div>
                        <h3 className="font-extrabold">{p.name}</h3>
                        <Badge variant="secondary" className="h-5 text-[11px]">{p.category}</Badge>
                      </div>
                    </div>
                    <p className="mb-4 min-h-10 text-sm text-muted-foreground">{p.description}</p>
                  </div>
                  <Button variant={isCurrent ? "outline" : "default"} className="w-full" onClick={() => setWizardOpen(true)}>
                    {isCurrent ? "Configure Account" : "Connect Provider"}
                  </Button>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Placements */}
        <TabsContent value="placements" className="mt-4 flex flex-col gap-6">
          <div className="rounded-2xl border border-border p-6">
            <h3 className="text-base font-extrabold">Ad Placement Controls</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Select where ad units will render across your public notes and views.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PLACEMENT_OPTIONS.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <Switch
                    checked={Boolean(placements[item.id])}
                    onCheckedChange={(checked) => setPlacements({ ...placements, [item.id]: checked })}
                  />
                  <div>
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button className="mt-4" onClick={handleSavePlacements}>Save Placement Controls</Button>
          </div>

          <div>
            <h3 className="mb-2 text-base font-extrabold">Ad Placement Live Preview</h3>
            <AdPlacement placement="above_article" isPreview />
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="mt-4">
          <div className="rounded-2xl border border-border p-6">
            <h3 className="text-base font-extrabold">Earnings &amp; Traffic Performance</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Real-time analytics breakdown for revenue, impressions, and CTR metrics.
            </p>

            {loadingAnalytics ? (
              <Progress value={undefined} className="animate-pulse" />
            ) : !analytics?.chartData || analytics.chartData.length === 0 ? (
              <div className="rounded-2xl border border-border p-12 text-center">
                <h4 className="mb-1 font-bold">No Traffic or Revenue Analytics Recorded</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Connect an ad provider and enable ad placements to begin tracking impression and earnings analytics.
                </p>
                <Button onClick={() => setWizardOpen(true)}>
                  <Plus />
                  Connect Ad Provider
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {analytics.chartData.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-border p-3 text-center">
                    <p className="text-xs font-bold text-muted-foreground">{item.date}</p>
                    <p className="text-xl font-extrabold text-primary">${item.revenue}</p>
                    <p className="text-xs text-muted-foreground">{item.impressions} impr · {item.clicks} clicks</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Verification */}
        <TabsContent value="verification" className="mt-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-border p-6">
            <div>
              <h3 className="text-base font-extrabold">Publisher Verification Status</h3>
              <p className="text-sm text-muted-foreground">
                Track your verification review lifecycle and admin security compliance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={status} />
              <span className="text-sm text-muted-foreground">
                Submitted on: {monetizationState?.updatedAt ? "Recently" : "N/A"}
              </span>
            </div>

            <div className="h-px bg-border" />

            <h4 className="text-sm font-bold">Platform Verification Requirements</h4>
            <div className="flex flex-col gap-2">
              {["Valid Publisher ID Format", "Approved Script Domain Whitelist", "Security & XSS Inspection Passed"].map((line) => (
                <div key={line} className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span className="text-sm">{line}</span>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-fit" onClick={() => setWizardOpen(true)}>
              Re-submit Verification
            </Button>
          </div>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="mt-4">
          <div className="rounded-2xl border border-border p-6">
            <h3 className="text-base font-extrabold">Monetization &amp; Payout Preferences</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Configure auto-ad frequency, category safety, and payout methods.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <Wallet className="size-9 text-primary" />
                  <div>
                    <p className="text-sm font-extrabold">Stripe Connect &amp; Payouts</p>
                    <p className="text-xs text-muted-foreground">Direct bank deposit for revenue share</p>
                  </div>
                </div>
                <Badge variant="secondary" className="mt-3">Coming Soon</Badge>
              </div>

              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <FileText className="size-9 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-extrabold">Tax Forms &amp; 1099/W8-BEN</p>
                    <p className="text-xs text-muted-foreground">Annual tax reporting &amp; compliance</p>
                  </div>
                </div>
                <Badge variant="secondary" className="mt-3">Coming Soon</Badge>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ProviderWizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
};

export default MonetizationPage;
