import React from "react";
import { Box, Typography, Paper, Chip, useTheme, alpha } from "@mui/material";
import { Verified as VerifiedIcon, Security as SecurityIcon } from "@mui/icons-material";
import { useMonetization } from "../../../context/MonetizationContext";
import { getProviderById } from "../providers";

/**
 * Sandboxed AdPlacement component.
 * Safely renders creator ad units or placeholder in preview/unverified state.
 */
export const AdPlacement = ({
  placement = "above_article",
  slotId = "",
  isPreview = false,
}) => {
  const theme = useTheme();
  const { monetizationState } = useMonetization();
  const isDark = theme.palette.mode === "dark";

  const isEnabled = isPreview || monetizationState?.placements?.[placement];
  const activeProviderId = monetizationState?.activeProviderId;
  const isVerified = isPreview || monetizationState?.status === "verified";
  const provider = getProviderById(activeProviderId);

  if (!isEnabled && !isPreview) return null;

  return (
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
      <Box direction="row" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="caption" fontWeight={700} color="text.disabled" letterSpacing="0.08em">
          SPONSORED ADVERTISEMENT
        </Typography>
        <Chip
          icon={<SecurityIcon sx={{ fontSize: "14px !important" }} />}
          label={provider ? provider.name : "Ad Network"}
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
        {isVerified ? (
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" fontWeight={700} color="primary.main">
              {provider?.name || "Active Ad Unit"} ({placement})
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              Publisher: {monetizationState?.publisherId || "pub-verified"} · Slot: {slotId || "default_slot"}
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
  );
};

export default AdPlacement;
