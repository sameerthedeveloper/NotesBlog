import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Divider,
  LinearProgress,
  TextField,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  MonetizationOnOutlined as MonetizationIcon,
  Storefront as ProviderIcon,
  ViewQuilt as PlacementIcon,
  BarChart as AnalyticsIcon,
  VerifiedUser as VerificationIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewsIcon,
  TouchApp as ClicksIcon,
  Percent as CtrIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon,
  HelpOutline as HelpIcon,
  AccountBalanceWallet as WalletIcon,
  Description as TaxIcon,
} from "@mui/icons-material";
import { useMonetization } from "../context/MonetizationContext";
import { getAllProviders } from "../features/monetization/providers";
import { getCreatorAnalytics } from "../features/monetization/services/monetizationService";
import ProviderWizardModal from "../features/monetization/components/ProviderWizardModal";
import AdPlacement from "../features/monetization/components/AdPlacement";
import toast from "react-hot-toast";

/* Helper for Tab Panel */
const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} id={`monetization-tabpanel-${index}`} {...other}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

export const MonetizationPage = () => {
  const theme = useTheme();
  const { monetizationState, activeProvider, savePlacementSettings } = useMonetization();

  const [currentTab, setCurrentTab] = useState(0);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Local state for placements tab
  const [placements, setPlacements] = useState(monetizationState?.placements || {
    above_article: true,
    below_article: true,
    inside_article: false,
    sidebar: true,
    home_feed: false,
    search_results: false,
    collections: false,
  });

  const [slotIds, setSlotIds] = useState(monetizationState?.slotIds || {
    above_article: "",
    below_article: "",
    inside_article: "",
    sidebar: "",
  });

  useEffect(() => {
    if (monetizationState) {
      if (monetizationState.placements) setPlacements(monetizationState.placements);
      if (monetizationState.slotIds) setSlotIds(monetizationState.slotIds);
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

  const getStatusBadge = () => {
    const status = monetizationState?.status || "not_connected";
    if (status === "verified") {
      return <Chip icon={<CheckCircleIcon />} label="Verified & Active" color="success" sx={{ fontWeight: 700 }} />;
    }
    if (status === "pending") {
      return <Chip icon={<PendingIcon />} label="Pending Verification" color="warning" sx={{ fontWeight: 700 }} />;
    }
    if (status === "rejected") {
      return <Chip icon={<RejectedIcon />} label="Rejected" color="error" sx={{ fontWeight: 700 }} />;
    }
    return <Chip label="Not Connected" color="default" sx={{ fontWeight: 700 }} />;
  };

  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <MonetizationIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight={800} letterSpacing="-0.5px">
              Creator Monetization Hub
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Provider-agnostic ad framework. Connect AdSense, Ad Manager, Media.net, Carbon Ads, or Custom partners.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {getStatusBadge()}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setWizardOpen(true)}
            sx={{ borderRadius: 2.5, px: 2.5, fontWeight: 700 }}
          >
            Connect Provider
          </Button>
        </Stack>
      </Box>

      {/* Tabs Bar */}
      <Paper variant="outlined" sx={{ borderRadius: 3, px: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(e, val) => setCurrentTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              fontWeight: 700,
              textTransform: "none",
              minHeight: 48,
            },
          }}
        >
          <Tab icon={<MonetizationIcon fontSize="small" />} iconPosition="start" label="Overview" />
          <Tab icon={<ProviderIcon fontSize="small" />} iconPosition="start" label="Providers" />
          <Tab icon={<PlacementIcon fontSize="small" />} iconPosition="start" label="Ad Placements" />
          <Tab icon={<AnalyticsIcon fontSize="small" />} iconPosition="start" label="Analytics" />
          <Tab icon={<VerificationIcon fontSize="small" />} iconPosition="start" label="Verification" />
          <Tab icon={<SettingsIcon fontSize="small" />} iconPosition="start" label="Settings" />
        </Tabs>
      </Paper>

      {/* Tab 0: Overview */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={2.5}>
          {/* Revenue Metric Cards */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ borderRadius: 3, p: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    ESTIMATED REVENUE
                  </Typography>
                  <TrendingUpIcon color="primary" fontSize="small" />
                </Stack>
                <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                  {analytics?.estimatedRevenue || "$0.00"}
                </Typography>
                <Typography variant="caption" color="success.main" fontWeight={700}>
                  +14.2% from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ borderRadius: 3, p: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    TODAY&apos;S EARNINGS
                  </Typography>
                  <MonetizationIcon color="success" fontSize="small" />
                </Stack>
                <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                  {analytics?.todayEarnings || "$0.00"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Updated real-time
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ borderRadius: 3, p: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    IMPRESSIONS
                  </Typography>
                  <ViewsIcon color="info" fontSize="small" />
                </Stack>
                <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                  {analytics?.impressions?.toLocaleString() || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  RPM: {analytics?.rpm || "$0.00"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ borderRadius: 3, p: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    CLICKS & CTR
                  </Typography>
                  <ClicksIcon color="warning" fontSize="small" />
                </Stack>
                <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                  {analytics?.clicks?.toLocaleString() || 0}
                </Typography>
                <Typography variant="caption" color="warning.main" fontWeight={700}>
                  CTR: {analytics?.ctr || "0%"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Status Alert Banner */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mt: 3,
            borderRadius: 3,
            borderColor: activeProvider ? "primary.main" : "divider",
            bgcolor: activeProvider ? alpha(theme.palette.primary.main, 0.04) : "background.paper",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {activeProvider ? `Active Provider: ${activeProvider.name}` : "No Ad Provider Connected"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {activeProvider
                  ? `Publisher ID: ${monetizationState?.publisherId}`
                  : "Connect an advertising provider to start monetizing your public notes."}
              </Typography>
            </Box>
            <Button
              variant={activeProvider ? "outlined" : "contained"}
              startIcon={<AddIcon />}
              onClick={() => setWizardOpen(true)}
              sx={{ borderRadius: 2.5, fontWeight: 700 }}
            >
              {activeProvider ? "Change Provider" : "Connect Ad Provider"}
            </Button>
          </Stack>
        </Paper>

        {/* Top Notes */}
        <Paper variant="outlined" sx={{ p: 3, mt: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
            Top Revenue Performing Notes
          </Typography>
          {!analytics?.topNotes || analytics.topNotes.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
              No ad revenue recorded yet. Connect an ad provider and publish notes to view performance.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {analytics.topNotes.map((note, i) => (
                <Stack
                  key={i}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: isDark ? alpha("#fff", 0.03) : alpha("#000", 0.02),
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>{note.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{note.views} views</Typography>
                  </Box>
                  <Chip label={note.revenue} color="success" size="small" sx={{ fontWeight: 800 }} />
                </Stack>
              ))}
            </Stack>
          )}
        </Paper>
      </TabPanel>

      {/* Tab 1: Providers */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={3}>
          {getAllProviders().map((p) => {
            const isCurrent = monetizationState?.activeProviderId === p.id;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 4,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderColor: isCurrent ? "primary.main" : "divider",
                    borderWidth: isCurrent ? 2 : 1,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Box
                        component="img"
                        src={p.logo}
                        alt={p.name}
                        onError={(e) => { e.target.src = "/logo.svg"; }}
                        sx={{ width: 44, height: 44, objectFit: "contain" }}
                      />
                      <Box>
                        <Typography variant="h6" fontWeight={800}>{p.name}</Typography>
                        <Chip label={p.category} size="small" sx={{ height: 20, fontSize: "0.68rem" }} />
                      </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, minHeight: 40 }}>
                      {p.description}
                    </Typography>
                    <Button
                      fullWidth
                      variant={isCurrent ? "outlined" : "contained"}
                      onClick={() => setWizardOpen(true)}
                      sx={{ borderRadius: 2.5, fontWeight: 700 }}
                    >
                      {isCurrent ? "Configure Account" : "Connect Provider"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </TabPanel>

      {/* Tab 2: Ad Placements */}
      <TabPanel value={currentTab} index={2}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Ad Placement Controls
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select where ad units will render across your public notes and views.
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {[
                { id: "above_article", label: "Above Article", desc: "Top banner before main note content" },
                { id: "below_article", label: "Below Article", desc: "Bottom banner after article conclusion" },
                { id: "inside_article", label: "Inside Long Articles", desc: "Inline banner within multi-paragraph notes" },
                { id: "sidebar", label: "Sidebar", desc: "Sticky sidebar ad unit" },
                { id: "home_feed", label: "Home Feed", desc: "Ad cards integrated into home feed list" },
                { id: "search_results", label: "Search Results", desc: "Sponsored placement in search page" },
                { id: "collections", label: "Collections", desc: "Note collection view placements" },
              ].map((item) => (
                <Grid size={{ xs: 12, sm: 6 }} key={item.id}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(placements[item.id])}
                          onChange={(e) => setPlacements({ ...placements, [item.id]: e.target.checked })}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>{item.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                        </Box>
                      }
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Button
              variant="contained"
              onClick={handleSavePlacements}
              sx={{ borderRadius: 2.5, px: 3, py: 1.2, fontWeight: 700, width: "fit-content" }}
            >
              Save Placement Controls
            </Button>
          </Stack>
        </Paper>

        {/* Live Ad Placement Preview */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            Ad Placement Live Preview
          </Typography>
          <AdPlacement placement="above_article" isPreview />
        </Box>
      </TabPanel>

      {/* Tab 3: Analytics */}
      <TabPanel value={currentTab} index={3}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            Earnings & Traffic Performance
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Real-time analytics Breakdown for revenue, impressions, and CTR metrics.
          </Typography>

          {loadingAnalytics ? (
            <LinearProgress sx={{ borderRadius: 2 }} />
          ) : !analytics?.chartData || analytics.chartData.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                No Traffic or Revenue Analytics Recorded
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Connect an ad provider and enable ad placements to begin tracking impression and earnings analytics.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setWizardOpen(true)}
                sx={{ borderRadius: 2.5, fontWeight: 700 }}
              >
                Connect Ad Provider
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {analytics.chartData.map((item, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>{item.date}</Typography>
                    <Typography variant="h5" fontWeight={800} color="primary.main">${item.revenue}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.impressions} impr · {item.clicks} clicks</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </TabPanel>

      {/* Tab 4: Verification */}
      <TabPanel value={currentTab} index={4}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Publisher Verification Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track your verification review lifecycle and admin security compliance.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {getStatusBadge()}
              <Typography variant="body2" color="text.secondary">
                Submitted on: {monetizationState?.updatedAt ? "Recently" : "N/A"}
              </Typography>
            </Box>

            <Divider />

            <Typography variant="subtitle1" fontWeight={700}>
              Platform Verification Requirements
            </Typography>

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircleIcon color="success" />
                <Typography variant="body2">Valid Publisher ID Format</Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircleIcon color="success" />
                <Typography variant="body2">Approved Script Domain Whitelist</Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircleIcon color="success" />
                <Typography variant="body2">Security & XSS Inspection Passed</Typography>
              </Stack>
            </Stack>

            <Button
              variant="outlined"
              onClick={() => setWizardOpen(true)}
              sx={{ borderRadius: 2.5, width: "fit-content", fontWeight: 700 }}
            >
              Re-submit Verification
            </Button>
          </Stack>
        </Paper>
      </TabPanel>

      {/* Tab 5: Settings */}
      <TabPanel value={currentTab} index={5}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Monetization & Payout Preferences
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure auto-ad frequency, category safety, and payout methods.
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <WalletIcon color="primary" sx={{ fontSize: 36 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>Stripe Connect & Payouts</Typography>
                      <Typography variant="caption" color="text.secondary">Direct bank deposit for revenue share</Typography>
                    </Box>
                  </Stack>
                  <Chip label="Coming Soon" size="small" sx={{ mt: 2, fontWeight: 700 }} />
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TaxIcon color="secondary" sx={{ fontSize: 36 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>Tax Forms & 1099/W8-BEN</Typography>
                      <Typography variant="caption" color="text.secondary">Annual tax reporting & compliance</Typography>
                    </Box>
                  </Stack>
                  <Chip label="Coming Soon" size="small" sx={{ mt: 2, fontWeight: 700 }} />
                </Card>
              </Grid>
            </Grid>
          </Stack>
        </Paper>
      </TabPanel>

      {/* 6-Step Connection Wizard Modal */}
      <ProviderWizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </Box>
  );
};

export default MonetizationPage;
