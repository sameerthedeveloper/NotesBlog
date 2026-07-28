import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Chip, Button, useTheme, alpha } from "@mui/material";
import { Verified as VerifiedIcon, Security as SecurityIcon, Add as AddIcon } from "@mui/icons-material";
import { useMonetization } from "../../../context/MonetizationContext";
import { usePlatformSettings } from "../../../context/PlatformSettingsContext";
import { getCreatorMonetization } from "../services/monetizationService";
import { getProviderById } from "../providers";
import ProviderWizardModal from "./ProviderWizardModal";

/**
 * Sandboxed AdPlacement component.
 * Safely renders creator ad units or empty state with "Connect Ad Provider" prompt.
 */
export const AdPlacement = ({
  placement = "above_article",
  slotId = "",
  isPreview = false,
  creatorUid = null,
  authorId = null,
}) => {
  const theme = useTheme();
  const { monetizationState: ownMonetizationState } = useMonetization();
  const { settings } = usePlatformSettings();
  const [creatorMonetization, setCreatorMonetization] = useState(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const isDark = theme.palette.mode === "dark";

  const targetUid = creatorUid || authorId;

  useEffect(() => {
    let isMounted = true;
    if (targetUid) {
      getCreatorMonetization(targetUid)
        .then((data) => {
          if (isMounted) setCreatorMonetization(data);
        })
        .catch(() => {
          if (isMounted) setCreatorMonetization(null);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [targetUid]);

  // Respect Global Feature Flags from Platform Control Center
  if (settings?.advertisements?.enableAds === false) return null;
  if (targetUid && settings?.creatorMonetization?.enableCreatorMonetization === false) return null;

  const activeMonetization = targetUid ? creatorMonetization : ownMonetizationState;
  const isEnabled = isPreview || activeMonetization?.placements?.[placement];
  const activeProviderId = activeMonetization?.activeProviderId;
  const isVerified = isPreview || activeMonetization?.status === "verified";
  const provider = getProviderById(activeProviderId);

  // If no provider connected and not in preview mode, don't display anything to readers
  if (!activeProviderId && !isPreview) {
    return null;
  }

  if (!isEnabled && !isPreview) return null;

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          my: 2.5,
          p: 2,
          borderRadius: 3,
          borderColor: isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08),
          bgcolor: isDark ? alpha(theme.palette.background.paper, 0.6) : alpha("#000", 0.015),
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="caption" fontWeight={700} color="text.disabled" letterSpacing="0.08em">
            SPONSORED ADVERTISEMENT
          </Typography>
          <Chip
            icon={<SecurityIcon sx={{ fontSize: "14px !important" }} />}
            label={provider ? provider.name : "No Provider Connected"}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: "0.68rem" }}
          />
        </Box>

        {/* Container Box */}
        <Box
          sx={{
            minHeight: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: `1px dashed ${isDark ? alpha("#fff", 0.15) : alpha("#000", 0.15)}`,
            borderRadius: 2,
            p: 2,
            bgcolor: isDark ? alpha("#000", 0.2) : alpha("#fff", 0.6),
          }}
        >
          {!activeProviderId ? (
            <Box sx={{ py: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
                No Advertising Provider Connected
              </Typography>
              <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 1.5 }}>
                Connect AdSense, Ad Manager, Media.net, Carbon, or a custom network to show ads.
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setWizardOpen(true)}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Connect Ad Provider
              </Button>
            </Box>
          ) : isVerified ? (
            <Box sx={{ width: "100%" }}>
              <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                {provider?.name || "Active Ad Unit"} ({placement})
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                Publisher: {activeMonetization?.publisherId} · Slot: {slotId || "default_slot"}
              </Typography>
            </Box>
          ) : (
            <Box>
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: "14px !important" }} />}
                label="Pending Creator Verification"
                color="warning"
                size="small"
                sx={{ mb: 1, fontWeight: 700 }}
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Ads will activate automatically once platform verification completes.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <ProviderWizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </>
  );
};

export default AdPlacement;
