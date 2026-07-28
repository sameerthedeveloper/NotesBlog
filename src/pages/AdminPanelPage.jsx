import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  Tabs,
  Tab
} from "@mui/material";
import {
  AdminPanelSettings as AdminIcon,
  AutoFixHigh as MigrateIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  CheckCircle as SuccessIcon,
  Tune as TuneIcon,
  MonetizationOnOutlined as MonetizationIcon,
  AutoAwesome as SparklesIcon,
  WifiOff as OfflineIcon
} from "@mui/icons-material";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { runNotesMigration } from "../utils/migration";
import { getAllVerificationsAdmin, updateVerificationStatusAdmin } from "../features/monetization/services/monetizationService";
import { useAuth } from "../context/AuthContext";
import { isSuperAdmin } from "../config/adminConfig";
import { usePlatformSettings } from "../context/PlatformSettingsContext";
import UnauthorizedPage from "./UnauthorizedPage";
import toast from "react-hot-toast";

export const AdminPanelPage = () => {
  const { currentUser } = useAuth();
  const { settings, updateSetting } = usePlatformSettings();
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({ totalNotes: 0, publicNotes: 0, htmlMigrated: 0 });
  const [notesList, setNotesList] = useState([]);
  const [verificationsList, setVerificationsList] = useState([]);
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, msg: "" });

  const isAdmin = isSuperAdmin(currentUser);

  const fetchAdminStats = React.useCallback(async () => {
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
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            Platform Control Center (Super Admin)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage real-time feature flags, monetization approvals, system status, and batch migrations.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<MigrateIcon />}
          onClick={handleRunBatchMigration}
          disabled={migrating}
          sx={{ borderRadius: 3, px: 3, fontWeight: 700 }}
        >
          Run Batch Migration
        </Button>
      </Box>

      {migrating && (
        <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            {progress.msg || "Migrating Firestore records..."}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress.total ? (progress.current / progress.total) * 100 : 0}
          />
        </Paper>
      )}

      {/* Tabs Bar */}
      <Tabs
        value={tabValue}
        onChange={(e, val) => setTabValue(val)}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab icon={<TuneIcon />} iconPosition="start" label="Feature Flags & Control" />
        <Tab icon={<MonetizationIcon />} iconPosition="start" label="Creator Approvals" />
        <Tab icon={<StorageIcon />} iconPosition="start" label="System Stats & Inventory" />
      </Tabs>

      {/* TAB 0: REALTIME FEATURE FLAGS */}
      {tabValue === 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* General & Platform Control */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <AdminIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  General & Maintenance Mode
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!settings?.general?.maintenanceMode}
                      onChange={() => handleToggleFeature("general", "maintenanceMode", settings?.general?.maintenanceMode)}
                      color="warning"
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={700}>Maintenance Mode</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Puts the application into read-only maintenance notice mode.
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={!!settings?.general?.registrationEnabled}
                      onChange={() => handleToggleFeature("general", "registrationEnabled", settings?.general?.registrationEnabled)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={700}>User Registration Enabled</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Allow new users to sign up for accounts.
                      </Typography>
                    </Box>
                  }
                />
              </Stack>
            </Paper>
          </Grid>

          {/* Advertisements & Monetization */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <MonetizationIcon color="success" />
                <Typography variant="h6" fontWeight={700}>
                  Global Advertising Controls
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!settings?.advertisements?.enableAds}
                      onChange={() => handleToggleFeature("advertisements", "enableAds", settings?.advertisements?.enableAds)}
                      color="success"
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={700}>Global Ads Master Switch</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Enable or disable all platform and creator advertisements instantly.
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={!!settings?.creatorMonetization?.enableCreatorMonetization}
                      onChange={() => handleToggleFeature("creatorMonetization", "enableCreatorMonetization", settings?.creatorMonetization?.enableCreatorMonetization)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={700}>Creator Monetization</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Allow verified creators to serve ads on their public notes.
                      </Typography>
                    </Box>
                  }
                />
              </Stack>
            </Paper>
          </Grid>

          {/* AI Features & Search */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <SparklesIcon color="secondary" />
                <Typography variant="h6" fontWeight={700}>
                  AI Assistant & Smart Tools
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!settings?.ai?.enableAI}
                      onChange={() => handleToggleFeature("ai", "enableAI", settings?.ai?.enableAI)}
                      color="secondary"
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={700}>Enable AI Features</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Prompt builder, summary generator, and smart note suggestions.
                      </Typography>
                    </Box>
                  }
                />
              </Stack>
            </Paper>
          </Grid>

          {/* Offline Mode & PWA Caching */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <OfflineIcon color="info" />
                <Typography variant="h6" fontWeight={700}>
                  Offline Mode & Sync Controls
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!settings?.offline?.offlineMode}
                      onChange={() => handleToggleFeature("offline", "offlineMode", settings?.offline?.offlineMode)}
                      color="info"
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={700}>Offline Architecture</Typography>
                      <Typography variant="caption" color="text.secondary">
                        IndexedDB caching and automatic background synchronization.
                      </Typography>
                    </Box>
                  }
                />
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: CREATOR APPROVALS */}
      {tabValue === 1 && (
        <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden", p: 2, mb: 4 }}>
          <Typography variant="h6" fontWeight={700} mb={2} px={1}>
            Creator Monetization Verifications
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Creator UID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Provider</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Publisher ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {verificationsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
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
                        <Chip
                          label={v.status}
                          size="small"
                          color={v.status === "verified" ? "success" : v.status === "pending" ? "warning" : "error"}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleUpdateStatus(v.uid, v.providerId, "verified")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleUpdateStatus(v.uid, v.providerId, "rejected")}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* TAB 2: SYSTEM STATS & INVENTORY */}
      {tabValue === 2 && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 3, p: 1 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Total Database Notes
                  </Typography>
                  <Typography variant="h3" fontWeight={800} color="primary.main">
                    {stats.totalNotes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 3, p: 1 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    HTML Clean Notes
                  </Typography>
                  <Typography variant="h3" fontWeight={800} color="success.main">
                    {stats.htmlMigrated}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 3, p: 1 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Public Shared Notes
                  </Typography>
                  <Typography variant="h3" fontWeight={800} color="info.main">
                    {stats.publicNotes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden", p: 2, mb: 4 }}>
            <Typography variant="h6" fontWeight={700} mb={2} px={1}>
              Firestore Document Records
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Note ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Format</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Visibility</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Views</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notesList.slice(0, 10).map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>{n.id}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{n.title || "Untitled"}</TableCell>
                      <TableCell>
                        <Chip
                          label={n.isMigratedToHtml ? "Clean HTML" : "Legacy"}
                          size="small"
                          color={n.isMigratedToHtml ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={n.visibility || "private"}
                          size="small"
                          variant="outlined"
                          color={n.visibility === "public" ? "primary" : "default"}
                        />
                      </TableCell>
                      <TableCell>{n.viewCount || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default AdminPanelPage;
