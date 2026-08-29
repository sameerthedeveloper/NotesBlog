"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Sparkles,
  Database,
  SlidersHorizontal,
  DollarSign,
  WifiOff,
} from "lucide-react";
import { db } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { runNotesMigration } from "@/utils/migration";
import { getAllVerificationsAdmin, updateVerificationStatusAdmin } from "@/features/monetization/services/monetizationService";
import { useAuth } from "@/context/AuthContext";
import { isSuperAdmin } from "@/config/adminConfig";
import { usePlatformSettings } from "@/context/PlatformSettingsContext";
import UnauthorizedPage from "@/components/UnauthorizedPage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function FeatureToggle({ title, desc, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export const AdminPanelPage = () => {
  const { currentUser } = useAuth();
  const { settings, updateSetting } = usePlatformSettings();
  const [stats, setStats] = useState({ totalNotes: 0, publicNotes: 0, htmlMigrated: 0 });
  const [notesList, setNotesList] = useState([]);
  const [verificationsList, setVerificationsList] = useState([]);
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, msg: "" });

  const isAdmin = isSuperAdmin(currentUser);

  const fetchAdminStats = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const snap = await getDocs(collection(db, "notes"));
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotesList(docs);

      const totalNotes = docs.length;
      const publicNotes = docs.filter((d) => d.visibility === "public").length;
      const htmlMigrated = docs.filter((d) => d.isMigratedToHtml || /^<[a-z1-6][\s\S]*>/i.test(d.content?.trim() || "")).length;

      setStats({ totalNotes, publicNotes, htmlMigrated });

      const verifs = await getAllVerificationsAdmin();
      setVerificationsList(verifs);
    } catch {
      // Ignored
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- initial admin stats fetch on mount
      fetchAdminStats();
    }
  }, [isAdmin, fetchAdminStats]);

  if (!isAdmin) {
    return <UnauthorizedPage />;
  }

  const handleUpdateStatus = async (uid, providerId, status) => {
    try {
      await updateVerificationStatusAdmin(uid, providerId, status);
      toast.success(`Verification status updated to ${status}!`);
      await fetchAdminStats();
    } catch {
      toast.error("Failed to update verification status.");
    }
  };

  const handleRunBatchMigration = async () => {
    setMigrating(true);
    try {
      const res = await runNotesMigration((cur, tot, msg) => {
        setProgress({ current: cur, total: tot, msg });
      });
      toast.success(`Batch migration finished! Converted ${res.converted} notes.`);
      await fetchAdminStats();
    } catch {
      toast.error("Migration failed");
    } finally {
      setMigrating(false);
    }
  };

  const handleToggleFeature = async (section, key, currentValue) => {
    try {
      await updateSetting(section, key, !currentValue);
      toast.success(`Updated ${section}.${key} to ${!currentValue ? "ENABLED" : "DISABLED"}`);
    } catch {
      toast.error("Failed to update platform setting.");
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Platform Control Center (Super Admin)</h1>
          <p className="text-muted-foreground">
            Manage real-time feature flags, monetization approvals, system status, and batch migrations.
          </p>
        </div>
        <Button onClick={handleRunBatchMigration} disabled={migrating}>
          <Sparkles />
          Run Batch Migration
        </Button>
      </div>

      {migrating && (
        <div className="mb-6 rounded-2xl border border-border p-4">
          <p className="mb-2 text-sm font-bold">{progress.msg || "Migrating Firestore records..."}</p>
          <Progress value={progress.total ? (progress.current / progress.total) * 100 : 0} />
        </div>
      )}

      <Tabs defaultValue="flags">
        <TabsList className="mb-4 w-full justify-start gap-1 bg-transparent">
          <TabsTrigger value="flags" className="gap-1.5 py-5 rounded-lg border border-border data-[state=active]:border-primary">
            <SlidersHorizontal className="size-4" />
            Feature Flags &amp; Control
          </TabsTrigger>
          <TabsTrigger value="approvals" className="gap-1.5 py-5 rounded-lg border border-border data-[state=active]:border-primary">
            <DollarSign className="size-4" />
            Creator Approvals
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5 py-5 rounded-lg border border-border data-[state=active]:border-primary">
            <Database className="size-4" />
            System Stats &amp; Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flags">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border p-6">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <h3 className="font-bold">General &amp; Maintenance Mode</h3>
              </div>
              <div className="mb-1 h-px bg-border" />
              <FeatureToggle
                title="Maintenance Mode"
                desc="Puts the application into read-only maintenance notice mode."
                checked={!!settings?.general?.maintenanceMode}
                onCheckedChange={() => handleToggleFeature("general", "maintenanceMode", settings?.general?.maintenanceMode)}
              />
              <FeatureToggle
                title="User Registration Enabled"
                desc="Allow new users to sign up for accounts."
                checked={!!settings?.general?.registrationEnabled}
                onCheckedChange={() => handleToggleFeature("general", "registrationEnabled", settings?.general?.registrationEnabled)}
              />
            </div>

            <div className="rounded-2xl border border-border p-6">
              <div className="mb-3 flex items-center gap-2">
                <DollarSign className="size-5 text-muted-foreground" />
                <h3 className="font-bold">Global Advertising Controls</h3>
              </div>
              <div className="mb-1 h-px bg-border" />
              <FeatureToggle
                title="Global Ads Master Switch"
                desc="Enable or disable all platform and creator advertisements instantly."
                checked={!!settings?.advertisements?.enableAds}
                onCheckedChange={() => handleToggleFeature("advertisements", "enableAds", settings?.advertisements?.enableAds)}
              />
              <FeatureToggle
                title="Creator Monetization"
                desc="Allow verified creators to serve ads on their public notes."
                checked={!!settings?.creatorMonetization?.enableCreatorMonetization}
                onCheckedChange={() => handleToggleFeature("creatorMonetization", "enableCreatorMonetization", settings?.creatorMonetization?.enableCreatorMonetization)}
              />
            </div>

            <div className="rounded-2xl border border-border p-6">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="size-5 text-muted-foreground" />
                <h3 className="font-bold">AI Assistant &amp; Smart Tools</h3>
              </div>
              <div className="mb-1 h-px bg-border" />
              <FeatureToggle
                title="Enable AI Features"
                desc="Prompt builder, summary generator, and smart note suggestions."
                checked={!!settings?.ai?.enableAI}
                onCheckedChange={() => handleToggleFeature("ai", "enableAI", settings?.ai?.enableAI)}
              />
            </div>

            <div className="rounded-2xl border border-border p-6">
              <div className="mb-3 flex items-center gap-2">
                <WifiOff className="size-5 text-muted-foreground" />
                <h3 className="font-bold">Offline Mode &amp; Sync Controls</h3>
              </div>
              <div className="mb-1 h-px bg-border" />
              <FeatureToggle
                title="Offline Architecture"
                desc="IndexedDB caching and automatic background synchronization."
                checked={!!settings?.offline?.offlineMode}
                onCheckedChange={() => handleToggleFeature("offline", "offlineMode", settings?.offline?.offlineMode)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="approvals">
          <div className="rounded-2xl border border-border p-4">
            <h3 className="mb-3 px-1 font-bold">Creator Monetization Verifications</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator UID</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Publisher ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verificationsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                      No pending verification requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  verificationsList.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.uid}</TableCell>
                      <TableCell>{v.providerId}</TableCell>
                      <TableCell>{v.publisherId}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            v.status === "verified"
                              ? "bg-success text-success-foreground"
                              : v.status === "pending"
                              ? "bg-warning text-warning-foreground"
                              : ""
                          }
                          variant={v.status === "verified" || v.status === "pending" ? "default" : "destructive"}
                        >
                          {v.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" className="bg-success hover:bg-success/85" onClick={() => handleUpdateStatus(v.uid, v.providerId, "verified")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleUpdateStatus(v.uid, v.providerId, "rejected")}>
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border p-4">
              <p className="text-sm font-semibold text-muted-foreground">Total Database Notes</p>
              <p className="text-3xl font-extrabold text-primary">{stats.totalNotes}</p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-sm font-semibold text-muted-foreground">HTML Clean Notes</p>
              <p className="text-3xl font-extrabold text-foreground">{stats.htmlMigrated}</p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-sm font-semibold text-muted-foreground">Public Shared Notes</p>
              <p className="text-3xl font-extrabold text-foreground">{stats.publicNotes}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <h3 className="mb-3 px-1 font-bold">Firestore Document Records</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Note ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notesList.slice(0, 10).map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-mono text-xs">{n.id}</TableCell>
                    <TableCell className="font-semibold">{n.title || "Untitled"}</TableCell>
                    <TableCell>
                      <Badge variant={n.isMigratedToHtml ? "default" : "secondary"} className={n.isMigratedToHtml ? "bg-success text-success-foreground" : ""}>
                        {n.isMigratedToHtml ? "Clean HTML" : "Legacy"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={n.visibility === "public" ? "border-primary text-primary" : ""}>
                        {n.visibility || "private"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{n.viewCount || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanelPage;
