import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip
} from "@mui/material";
import {
  EditNote as EditNoteIcon,
  Security as SecurityIcon,
  Devices as DevicesIcon,
  Speed as SpeedIcon,
  CloudDone as CloudIcon,
  Share as ShareIcon,
  ArrowForward as ArrowForwardIcon
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

export const LandingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const features = [
    {
      icon: <EditNoteIcon fontSize="large" color="primary" />,
      title: "TipTap Rich Text Editor",
      description: "Complete formatting toolbar with support for headings, tables, task lists, code blocks, images, and embedded video."
    },
    {
      icon: <SecurityIcon fontSize="large" color="primary" />,
      title: "DOMPurify XSS Protection",
      description: "Strict HTML sanitization ensures your shared notes remain secure, removing malicious scripts and unsafe tags."
    },
    {
      icon: <CloudIcon fontSize="large" color="primary" />,
      title: "Real-Time Cloud Sync",
      description: "Instant Firestore synchronization with auto-save and continuous viewer tracking."
    },
    {
      icon: <ShareIcon fontSize="large" color="primary" />,
      title: "Seamless Sharing & Export",
      description: "Share notes via public links or export notes to PDF, DOCX (Word), HTML, and direct Print."
    },
    {
      icon: <DevicesIcon fontSize="large" color="primary" />,
      title: "Material Design 3 Theme",
      description: "Built with the latest Material UI v7 framework featuring light/dark mode and dynamic color accents."
    },
    {
      icon: <SpeedIcon fontSize="large" color="primary" />,
      title: "HTML Search & Highlighting",
      description: "Search deep inside raw HTML content with automated match highlighting and tag filters."
    }
  ];

  return (
    <Box sx={{ bgcolor: "background.default", color: "text.primary", minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 14 },
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "radial-gradient(circle at 50% 30%, rgba(168, 199, 250, 0.1) 0%, rgba(19, 19, 20, 0) 70%)"
              : "radial-gradient(circle at 50% 30%, rgba(211, 227, 253, 0.5) 0%, rgba(240, 244, 249, 0) 70%)",
          textAlign: "center"
        }}
      >
        <Container maxWidth="md">
          <Chip
            label="Version 2.0 Modernization Released"
            color="primary"
            variant="outlined"
            sx={{ mb: 3, fontWeight: 700, px: 1, borderRadius: 3 }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
              fontWeight: 800,
              lineHeight: 1.15,
              mb: 3,
              background: "linear-gradient(135deg, #0B57D0 0%, #00838F 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Create, Collaborate & Share Notes Effortlessly
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, fontWeight: 400, lineHeight: 1.6, maxWidth: 700, mx: "auto" }}
          >
            Upgrade your workflow with secure HTML-based rich text note taking, automated Markdown migration, real-time viewer tracking, and export options.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            {currentUser ? (
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate("/dashboard")}
                sx={{ borderRadius: 3, px: 4, py: 1.5, fontSize: "1.05rem", fontWeight: 700 }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/signup")}
                  sx={{ borderRadius: 3, px: 4, py: 1.5, fontSize: "1.05rem", fontWeight: 700 }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/login")}
                  sx={{ borderRadius: 3, px: 4, py: 1.5, fontSize: "1.05rem", fontWeight: 700 }}
                >
                  Sign In
                </Button>
              </>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Features Grid */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" fontWeight={800} sx={{ mb: 2 }}>
          Everything You Need in a Note Platform
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Designed with state-of-the-art security, performance, and accessibility.
        </Typography>

        <Grid container spacing={3}>
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  p: 1,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: "primary.main",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)"
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
