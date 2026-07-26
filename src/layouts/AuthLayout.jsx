import React from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import {
  AutoStories as NotesIcon,
  FormatColorText as RichTextIcon,
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  DarkMode as DarkModeIcon,
  Folder as CollectionIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

/* ---------- feature list ---------- */
const FEATURES = [
  { icon: NotesIcon,      label: "Beautiful HTML Notes",  desc: "Write stunning notes with rich formatting" },
  { icon: RichTextIcon,   label: "Rich Text Editor",       desc: "TipTap-powered block editor experience" },
  { icon: CollectionIcon, label: "Collections",            desc: "Organize notes into themed collections" },
  { icon: SearchIcon,     label: "Instant Search",         desc: "Find anything across all your notes" },
  { icon: BookmarkIcon,   label: "Bookmarks",              desc: "Save important notes for quick access" },
  { icon: DarkModeIcon,   label: "Dark Mode",              desc: "Works beautifully in light and dark" },
];

/* ---------- minimal abstract floating shapes ---------- */
const FloatingShapes = () => (
  <>
    {/* Large soft circle — top right */}
    <Box
      sx={{
        position: "absolute",
        width: 340,
        height: 340,
        borderRadius: "50%",
        top: -80,
        right: -80,
        background: `radial-gradient(circle, ${alpha("#ffffff", 0.12)} 0%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
    {/* Medium ring — bottom left */}
    <Box
      sx={{
        position: "absolute",
        width: 220,
        height: 220,
        borderRadius: "50%",
        bottom: 60,
        left: -60,
        border: `2px solid ${alpha("#ffffff", 0.12)}`,
        pointerEvents: "none",
      }}
    />
    {/* Small solid circle — mid */}
    <Box
      sx={{
        position: "absolute",
        width: 80,
        height: 80,
        borderRadius: "50%",
        top: "42%",
        right: 32,
        background: alpha("#ffffff", 0.08),
        pointerEvents: "none",
      }}
    />
    {/* Note card mock — floating */}
    <Box
      sx={{
        position: "absolute",
        bottom: 120,
        right: 32,
        width: 180,
        p: 2,
        borderRadius: 3,
        background: alpha("#ffffff", 0.1),
        backdropFilter: "blur(8px)",
        border: `1px solid ${alpha("#ffffff", 0.15)}`,
        pointerEvents: "none",
      }}
    >
      <Box sx={{ width: "60%", height: 8, borderRadius: 2, bgcolor: alpha("#fff", 0.5), mb: 1 }} />
      <Box sx={{ width: "90%", height: 6, borderRadius: 2, bgcolor: alpha("#fff", 0.25), mb: 0.75 }} />
      <Box sx={{ width: "75%", height: 6, borderRadius: 2, bgcolor: alpha("#fff", 0.25) }} />
    </Box>
    {/* Second card mock */}
    <Box
      sx={{
        position: "absolute",
        top: "38%",
        left: 24,
        width: 140,
        p: 1.5,
        borderRadius: 2.5,
        background: alpha("#ffffff", 0.08),
        backdropFilter: "blur(8px)",
        border: `1px solid ${alpha("#ffffff", 0.12)}`,
        pointerEvents: "none",
      }}
    >
      <Box sx={{ width: "50%", height: 7, borderRadius: 2, bgcolor: alpha("#fff", 0.4), mb: 0.75 }} />
      <Box sx={{ width: "80%", height: 5, borderRadius: 2, bgcolor: alpha("#fff", 0.2) }} />
    </Box>
  </>
);

/* ---------- left branding panel ---------- */
const BrandPanel = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        width: { md: "45%" },
        flexShrink: 0,
        minHeight: "100vh",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: isDark
          ? `linear-gradient(145deg, #0B2E6E 0%, #0842A0 45%, #0B57D0 100%)`
          : `linear-gradient(145deg, #0B2E6E 0%, #0B57D0 55%, #1a73e8 100%)`,
        p: { md: 5, lg: 7 },
      }}
    >
      <FloatingShapes />

      {/* Content */}
      <Stack spacing={5} sx={{ position: "relative", zIndex: 1 }}>
        {/* Logo + Name */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            component="img"
            src="/logo.svg"
            alt="OpenNotes"
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          />
          <Typography
            variant="h6"
            fontWeight={900}
            letterSpacing="-0.5px"
            color="#ffffff"
          >
            OpenNotes
          </Typography>
        </Stack>

        {/* Headline */}
        <Stack spacing={2}>
          <Typography
            component="h1"
            sx={{
              fontSize: { md: "2rem", lg: "2.5rem" },
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#ffffff",
              lineHeight: 1.15,
            }}
          >
            Organize Knowledge.
            <br />
            Share Ideas.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: alpha("#ffffff", 0.75),
              fontWeight: 400,
              lineHeight: 1.7,
              maxWidth: 340,
              fontSize: "0.95rem",
            }}
          >
            A modern workspace for creating, organizing, and collaborating on beautiful notes.
          </Typography>
        </Stack>

        {/* Feature list */}
        <Stack spacing={2}>
          {FEATURES.map(({ icon, label, desc }) => (
            <Stack key={label} direction="row" spacing={2} alignItems="flex-start">
              <Box
                sx={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha("#ffffff", 0.12),
                  backdropFilter: "blur(4px)",
                  border: `1px solid ${alpha("#ffffff", 0.1)}`,
                }}
              >
                {React.createElement(icon, { sx: { fontSize: 18, color: "#ffffff" } })}
              </Box>
              <Stack spacing={0.2}>
                <Typography variant="body2" fontWeight={700} color="#ffffff" lineHeight={1.3}>
                  {label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: alpha("#ffffff", 0.6), lineHeight: 1.4, display: "block" }}
                >
                  {desc}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>

        {/* Badge */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 0.75,
            borderRadius: 10,
            bgcolor: alpha("#ffffff", 0.1),
            border: `1px solid ${alpha("#ffffff", 0.15)}`,
            width: "fit-content",
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "#4ade80",
              boxShadow: "0 0 0 3px rgba(74, 222, 128, 0.25)",
            }}
          />
          <Typography variant="caption" fontWeight={700} color={alpha("#ffffff", 0.85)}>
            Free forever · No credit card required
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

/* ---------- right form panel ---------- */
const FormPanel = ({ children }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
        px: { xs: 2, sm: 4, md: 5, lg: 8 },
        py: { xs: 5, md: 6 },
        /* subtle ambient glow */
        "&::before": {
          content: '""',
          position: "absolute",
          width: 480,
          height: 480,
          borderRadius: "50%",
          top: -180,
          right: -180,
          background: isDark
            ? `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 65%)`
            : `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 65%)`,
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: 360,
          height: 360,
          borderRadius: "50%",
          bottom: -120,
          left: -120,
          background: isDark
            ? `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 65%)`
            : `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.04)} 0%, transparent 65%)`,
          pointerEvents: "none",
        },
      }}
    >
      {/* Mobile logo (only visible on sm/xs) */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          gap: 1.5,
          mb: 4,
        }}
      >
        <Box
          component="img"
          src="/logo.svg"
          alt="OpenNotes"
          sx={{ width: 40, height: 40, borderRadius: "12px" }}
        />
        <Typography variant="h6" fontWeight={900} letterSpacing="-0.5px" color="text.primary">
          OpenNotes
        </Typography>
      </Box>

      {/* Actual form content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 420,
        }}
      >
        {children}
      </Box>

      {/* Footer terms */}
      <Typography
        variant="caption"
        color="text.disabled"
        align="center"
        fontWeight={500}
        sx={{ mt: 4, position: "relative", zIndex: 1 }}
      >
        Protected by OpenNotes · By continuing, you agree to our{" "}
        <Box
          component="span"
          sx={{
            color: "text.secondary",
            fontWeight: 700,
            cursor: "pointer",
            "&:hover": { color: "text.primary" },
          }}
        >
          Terms
        </Box>{" "}
        &amp;{" "}
        <Box
          component="span"
          sx={{
            color: "text.secondary",
            fontWeight: 700,
            cursor: "pointer",
            "&:hover": { color: "text.primary" },
          }}
        >
          Privacy Policy
        </Box>
      </Typography>
    </Box>
  );
};

/* ---------- root layout ---------- */
const AuthLayout = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const from = location.state?.from || "/";

  if (currentUser) {
    return <Navigate to={from} replace />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <BrandPanel />
      <FormPanel>
        <Outlet />
      </FormPanel>
    </Box>
  );
};

export default AuthLayout;
