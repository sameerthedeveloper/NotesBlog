import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
  LinearProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import {
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  NoteAdd as NoteAddIcon,
  Dashboard as DashboardIcon,
  AutoStories as AutoStoriesIcon,
  FolderSpecial as OrganizeIcon,
  Share as ShareIcon,
  Tune as PersonalizeIcon,
  Celebration as CelebrationIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  BookmarkBorder as BookmarkIcon,
  Label as TagIcon,
  Public as PublicIcon,
  Link as LinkIcon,
  FormatBold as FormatBoldIcon,
  Code as CodeIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// ─── Step Illustrations ───────────────────────────────────────────────────────

const WelcomeIllustration = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box sx={{ position: "relative", width: 220, height: 180, mx: "auto" }}>
      {/* Background glow */}
      <Box sx={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: isDark
          ? "radial-gradient(circle, rgba(168,199,250,0.15) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(11,87,208,0.10) 0%, transparent 70%)",
      }} />
      {/* Main floating card */}
      <Box sx={{
        position: "absolute", top: "12%", left: "50%", transform: "translateX(-50%)",
        width: 160, height: 110, borderRadius: 4,
        bgcolor: "background.paper", border: "1.5px solid", borderColor: "divider",
        boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(11,87,208,0.12)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Simulated toolbar */}
        <Box sx={{ height: 28, bgcolor: isDark ? "#2A2B2E" : "#F0F4F9", px: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}>
          {["#FF5F57","#FFBD2E","#28CA41"].map((c, i) => (
            <Box key={i} sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: c }} />
          ))}
        </Box>
        {/* Simulated content lines */}
        <Box sx={{ p: 1.5, flex: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Box sx={{ height: 8, borderRadius: 1, bgcolor: "primary.main", width: "70%", opacity: 0.8 }} />
          <Box sx={{ height: 6, borderRadius: 1, bgcolor: "divider", width: "90%" }} />
          <Box sx={{ height: 6, borderRadius: 1, bgcolor: "divider", width: "75%" }} />
          <Box sx={{ height: 6, borderRadius: 1, bgcolor: "divider", width: "55%" }} />
        </Box>
      </Box>
      {/* Floating badge */}
      <Box sx={{
        position: "absolute", bottom: "8%", right: "5%",
        width: 48, height: 48, borderRadius: "50%",
        bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 16px ${alpha("#0B57D0", 0.4)}`,
        animation: "float 3s ease-in-out infinite",
      }}>
        <AutoStoriesIcon sx={{ fontSize: 22, color: "#fff" }} />
      </Box>
    </Box>
  );
};

const EditorIllustration = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const features = [
    { icon: <FormatBoldIcon sx={{ fontSize: 14 }} />, label: "Rich Format" },
    { icon: <ImageIcon sx={{ fontSize: 14 }} />, label: "Images" },
    { icon: <CodeIcon sx={{ fontSize: 14 }} />, label: "Code Blocks" },
  ];
  return (
    <Box sx={{ width: 220, height: 180, mx: "auto", position: "relative" }}>
      <Box sx={{
        width: 180, height: 130, mx: "auto", mt: 1, borderRadius: 3,
        bgcolor: "background.paper", border: "1.5px solid", borderColor: "divider",
        boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}>
        {/* Formatting toolbar */}
        <Box sx={{
          height: 32, px: 1.5, display: "flex", alignItems: "center", gap: 1,
          bgcolor: isDark ? "#2A2B2E" : "#F8FAFF", borderBottom: "1px solid", borderColor: "divider",
        }}>
          {features.map((f, i) => (
            <Box key={i} sx={{
              px: 0.75, py: 0.25, borderRadius: 1, display: "flex", alignItems: "center", gap: 0.4,
              bgcolor: i === 0 ? alpha("#0B57D0", 0.12) : "transparent",
              color: i === 0 ? "primary.main" : "text.secondary",
            }}>
              {f.icon}
              <Typography sx={{ fontSize: "0.55rem", fontWeight: 600 }}>{f.label}</Typography>
            </Box>
          ))}
        </Box>
        {/* Content area */}
        <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Box sx={{ height: 9, borderRadius: 1, bgcolor: "primary.main", width: "60%", opacity: 0.9 }} />
          <Box sx={{ height: 6, borderRadius: 1, bgcolor: "divider", width: "95%" }} />
          <Box sx={{ height: 6, borderRadius: 1, bgcolor: "divider", width: "80%" }} />
          <Box sx={{ height: 24, borderRadius: 1.5, bgcolor: isDark ? "#1A1A1A" : "#F5F5F5", mt: 0.5,
            border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", px: 1 }}>
            <Typography sx={{ fontSize: "0.5rem", fontFamily: "monospace", color: "text.secondary" }}>
              {"// code block"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const OrganizeIllustration = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const colors = ["#0B57D0","#7C3AED","#059669","#D97706"];
  const labels = ["Work","Personal","Ideas","Archive"];
  return (
    <Box sx={{ width: 220, height: 180, mx: "auto", display: "flex", flexDirection: "column", gap: 1, pt: 2 }}>
      {labels.map((label, i) => (
        <Box key={i} sx={{
          display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 0.75,
          borderRadius: 2, bgcolor: "background.paper", border: "1px solid", borderColor: "divider",
          boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.04)",
          transform: `translateX(${i % 2 === 0 ? 0 : 8}px)`,
        }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: colors[i], flexShrink: 0 }} />
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, flex: 1 }}>{label}</Typography>
          <Typography sx={{ fontSize: "0.6rem", color: "text.secondary" }}>{[12,8,24,5][i]} notes</Typography>
        </Box>
      ))}
    </Box>
  );
};

const ShareIllustration = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box sx={{ width: 220, height: 180, mx: "auto", position: "relative", pt: 2 }}>
      <Box sx={{
        width: 180, height: 120, mx: "auto", borderRadius: 3,
        bgcolor: "background.paper", border: "1.5px solid", borderColor: "divider",
        boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.06)",
        p: 2, display: "flex", flexDirection: "column", gap: 1.5,
      }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "primary.main",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PublicIcon sx={{ fontSize: 14, color: "#fff" }} />
          </Box>
          <Box>
            <Box sx={{ height: 7, borderRadius: 1, bgcolor: "primary.main", width: 80, opacity: 0.8 }} />
            <Box sx={{ height: 5, borderRadius: 1, bgcolor: "divider", width: 50, mt: 0.5 }} />
          </Box>
        </Stack>
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.75,
          borderRadius: 2, bgcolor: isDark ? "#1A1A1A" : "#F0F4F9",
          border: "1px solid", borderColor: "divider",
        }}>
          <LinkIcon sx={{ fontSize: 12, color: "primary.main" }} />
          <Typography sx={{ fontSize: "0.5rem", color: "text.secondary", flex: 1 }}>opennotes.app/note/xyz...</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {[0,1,2].map(i => (
            <Box key={i} sx={{ width: 22, height: 22, borderRadius: "50%",
              bgcolor: ["primary.main","#7C3AED","#059669"][i], border: "2px solid",
              borderColor: "background.paper", ml: i > 0 ? -0.5 : 0 }} />
          ))}
          <Typography sx={{ fontSize: "0.55rem", color: "text.secondary", alignSelf: "center", ml: 0.5 }}>+47 views</Typography>
        </Stack>
      </Box>
    </Box>
  );
};

const PersonalizeIllustration = ({ currentMode }) => {
  const theme = useTheme();
  return (
    <Box sx={{ width: 220, height: 160, mx: "auto", display: "flex", gap: 2, justifyContent: "center", pt: 2 }}>
      {/* Light theme preview */}
      <Box sx={{
        width: 88, height: 110, borderRadius: 3, overflow: "hidden",
        border: "2px solid", borderColor: currentMode === "light" ? "primary.main" : "divider",
        bgcolor: "#F0F4F9", transition: "border-color 0.3s",
        boxShadow: currentMode === "light" ? `0 0 0 3px ${alpha("#0B57D0", 0.2)}` : "none",
      }}>
        <Box sx={{ height: 24, bgcolor: "#FFFFFF", px: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#0B57D0" }} />
          <Box sx={{ flex: 1, height: 4, borderRadius: 1, bgcolor: "#E0E0E0" }} />
        </Box>
        <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 0.6 }}>
          {[60, 90, 75].map((w, i) => (
            <Box key={i} sx={{ height: 5, borderRadius: 1, bgcolor: i === 0 ? "#0B57D0" : "#D0D0D0", width: `${w}%`, opacity: i === 0 ? 0.9 : 0.5 }} />
          ))}
        </Box>
        <Box sx={{ mx: 1, mt: 0.5, display: "flex", alignItems: "center", gap: 0.4 }}>
          <LightModeIcon sx={{ fontSize: 10, color: "#F59E0B" }} />
          <Typography sx={{ fontSize: "0.5rem", color: "#444", fontWeight: 700 }}>Light</Typography>
        </Box>
      </Box>
      {/* Dark theme preview */}
      <Box sx={{
        width: 88, height: 110, borderRadius: 3, overflow: "hidden",
        border: "2px solid", borderColor: currentMode === "dark" ? "primary.main" : "divider",
        bgcolor: "#131314", transition: "border-color 0.3s",
        boxShadow: currentMode === "dark" ? `0 0 0 3px ${alpha("#A8C7FA", 0.2)}` : "none",
      }}>
        <Box sx={{ height: 24, bgcolor: "#1E1F22", px: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#A8C7FA" }} />
          <Box sx={{ flex: 1, height: 4, borderRadius: 1, bgcolor: "#2A2B2E" }} />
        </Box>
        <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 0.6 }}>
          {[60, 90, 75].map((w, i) => (
            <Box key={i} sx={{ height: 5, borderRadius: 1, bgcolor: i === 0 ? "#A8C7FA" : "#2A2B2E", width: `${w}%`, opacity: i === 0 ? 0.9 : 0.6 }} />
          ))}
        </Box>
        <Box sx={{ mx: 1, mt: 0.5, display: "flex", alignItems: "center", gap: 0.4 }}>
          <DarkModeIcon sx={{ fontSize: 10, color: "#A8C7FA" }} />
          <Typography sx={{ fontSize: "0.5rem", color: "#A8C7FA", fontWeight: 700 }}>Dark</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const CelebrationIllustration = () => {
  const theme = useTheme();
  return (
    <Box sx={{ width: 220, height: 180, mx: "auto", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      {/* Confetti dots */}
      {[
        { top: "5%", left: "15%", color: "#0B57D0", size: 10 },
        { top: "10%", right: "12%", color: "#7C3AED", size: 8 },
        { top: "30%", left: "5%", color: "#059669", size: 6 },
        { top: "20%", right: "20%", color: "#D97706", size: 10 },
        { bottom: "20%", left: "10%", color: "#EF4444", size: 8 },
        { bottom: "15%", right: "10%", color: "#0B57D0", size: 10 },
        { bottom: "35%", left: "20%", color: "#7C3AED", size: 6 },
        { top: "50%", right: "5%", color: "#059669", size: 8 },
      ].map((dot, i) => (
        <Box key={i} sx={{
          position: "absolute", width: dot.size, height: dot.size,
          borderRadius: "50%", bgcolor: dot.color, opacity: 0.8,
          ...dot,
          animation: `confettiBounce${i % 3} ${1.5 + i * 0.2}s ease-in-out infinite alternate`,
        }} />
      ))}
      {/* Center icon */}
      <Box sx={{
        width: 100, height: 100, borderRadius: "50%",
        background: "linear-gradient(135deg, #0B57D0 0%, #7C3AED 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 12px 40px rgba(11,87,208,0.35)",
        animation: "celebrationPulse 2s ease-in-out infinite",
      }}>
        <CelebrationIcon sx={{ fontSize: 50, color: "#fff" }} />
      </Box>
    </Box>
  );
};

// ─── Step Configuration ────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 1,
    icon: <DashboardIcon />,
    title: "Welcome to OpenNotes",
    subtitle: "Your personal knowledge workspace",
    description: "We're thrilled to have you! OpenNotes is where your ideas, research, and knowledge come together in a beautiful, organized workspace.",
    color: "#0B57D0",
    Illustration: WelcomeIllustration,
    highlights: null,
  },
  {
    id: 2,
    icon: <NoteAddIcon />,
    title: "Create Beautiful Notes",
    subtitle: "Write with a powerful rich editor",
    description: "Craft stunning documents with our full-featured editor. Format text, embed images, add code blocks, tables, and seamlessly convert Markdown to HTML.",
    color: "#7C3AED",
    Illustration: EditorIllustration,
    highlights: ["Rich Text Formatting", "Embedded Images", "Code Blocks & Tables", "Markdown → HTML"],
  },
  {
    id: 3,
    icon: <OrganizeIcon />,
    title: "Organize Everything",
    subtitle: "Collections, tags, and smart filtering",
    description: "Keep your knowledge base structured. Use collections to group notes, add tags for cross-referencing, and bookmark your most important content.",
    color: "#059669",
    Illustration: OrganizeIllustration,
    highlights: ["Collections & Folders", "Smart Tags", "Bookmarks & Favorites", "Pinned Notes"],
  },
  {
    id: 4,
    icon: <ShareIcon />,
    title: "Share Your Knowledge",
    subtitle: "Publish, collaborate, and grow",
    description: "Share notes with unique public links, publish to the Discover feed to build an audience, and collaborate with others in real time.",
    color: "#D97706",
    Illustration: ShareIllustration,
    highlights: ["Public Note Sharing", "Unique Share Links", "Discover Feed", "View Analytics"],
  },
  {
    id: 5,
    icon: <PersonalizeIcon />,
    title: "Personalize Your Workspace",
    subtitle: "Make it feel like home",
    description: "Choose the visual theme that suits you best. Your preference is saved and synced across sessions.",
    color: "#EF4444",
    Illustration: PersonalizeIllustration,
    highlights: null,
    isPersonalize: true,
  },
  {
    id: 6,
    icon: <CelebrationIcon />,
    title: "You're All Set! 🎉",
    subtitle: "Your workspace is ready",
    description: "Everything is in place. Create your first note and start building your personal knowledge base — your ideas deserve a beautiful home.",
    color: "#0B57D0",
    Illustration: CelebrationIllustration,
    highlights: null,
    isFinal: true,
  },
];

// ─── Main Component ────────────────────────────────────────────────────────────

const OnboardingWizardModal = () => {
  const { onboardingOpen, setOnboardingOpen, completeOnboarding, currentUser } = useAuth();
  const { mode, toggleColorMode } = useAppTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";

  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [direction, setDirection] = useState("forward");

  const totalSteps = STEPS.length;
  const currentStep = STEPS[step];
  const progress = ((step + 1) / totalSteps) * 100;

  // Keyboard navigation
  useEffect(() => {
    if (!onboardingOpen) return;
    const handler = (e) => {
      if (e.key === "ArrowRight" && step < totalSteps - 1) goNext();
      if (e.key === "ArrowLeft" && step > 0) goBack();
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onboardingOpen, step]);

  // Animate step transitions
  const animateTransition = useCallback((dir, fn) => {
    setDirection(dir);
    setExiting(true);
    setTimeout(() => {
      fn();
      setExiting(false);
    }, 200);
  }, []);

  const goNext = () => {
    if (step < totalSteps - 1) {
      animateTransition("forward", () => setStep((s) => s + 1));
    }
  };

  const goBack = () => {
    if (step > 0) {
      animateTransition("backward", () => setStep((s) => s - 1));
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const handleFinish = async (action) => {
    await completeOnboarding();
    toast.success("Welcome to OpenNotes! 🎉", { icon: "🚀", duration: 3500 });
    if (action === "create") navigate("/note/new");
    else navigate("/dashboard");
  };

  if (!onboardingOpen) return null;

  const { Illustration, highlights, isPersonalize, isFinal } = currentStep;

  return (
    <>
      {/* Global animation keyframes injected as style */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes celebrationPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 12px 40px rgba(11,87,208,0.35); }
          50% { transform: scale(1.06); box-shadow: 0 16px 50px rgba(11,87,208,0.5); }
        }
        @keyframes confettiBounce0 {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-12px) rotate(15deg); }
        }
        @keyframes confettiBounce1 {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(10px) rotate(-10deg); }
        }
        @keyframes confettiBounce2 {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-8px) scale(1.2); }
        }
        @keyframes slideInForward {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInBackward {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(${direction === "forward" ? "-16px" : "16px"}); }
        }
      `}</style>

      <Dialog
        open={onboardingOpen}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : "28px",
            overflow: "hidden",
            bgcolor: "background.paper",
            backgroundImage: "none",
            boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
            maxHeight: isMobile ? "100%" : "90vh",
          }
        }}
        sx={{ backdropFilter: "blur(6px)" }}
      >
        {/* Progress bar */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 3,
            bgcolor: alpha(currentStep.color, 0.1),
            "& .MuiLinearProgress-bar": {
              bgcolor: currentStep.color,
              transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }
          }}
        />

        {/* Header */}
        <Box sx={{ px: { xs: 2.5, sm: 4 }, pt: { xs: 2, sm: 3 }, pb: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Step {step + 1} of {totalSteps}
            </Typography>
          </Stack>

          {/* Step dots */}
          <Stack direction="row" spacing={0.75} alignItems="center">
            {STEPS.map((_, i) => (
              <Box
                key={i}
                onClick={() => {
                  if (i < step) animateTransition("backward", () => setStep(i));
                  else if (i > step) animateTransition("forward", () => setStep(i));
                }}
                sx={{
                  width: i === step ? 20 : 7,
                  height: 7,
                  borderRadius: 4,
                  bgcolor: i === step ? currentStep.color : i < step ? alpha(currentStep.color, 0.4) : "divider",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            ))}
          </Stack>

          <IconButton
            size="small"
            onClick={handleSkip}
            sx={{ color: "text.secondary", "&:hover": { bgcolor: alpha("#000", 0.05) } }}
            aria-label="Skip onboarding"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            px: { xs: 2.5, sm: 4 },
            pt: 3,
            pb: { xs: 2.5, sm: 4 },
            animation: exiting
              ? "fadeOut 0.2s ease forwards"
              : direction === "forward"
                ? "slideInForward 0.25s ease"
                : "slideInBackward 0.25s ease",
            overflow: "auto",
          }}
        >
          {/* Step icon */}
          <Box
            sx={{
              width: 52, height: 52, borderRadius: "16px", mb: 3, mx: "auto",
              bgcolor: alpha(currentStep.color, isDark ? 0.2 : 0.1),
              color: currentStep.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26,
            }}
          >
            {React.cloneElement(currentStep.icon, { sx: { fontSize: 26 } })}
          </Box>

          {/* Title & subtitle */}
          <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h5"
              fontWeight={800}
              letterSpacing="-0.03em"
              gutterBottom
              sx={{ fontSize: { xs: "1.35rem", sm: "1.6rem" } }}
            >
              {currentStep.title}
            </Typography>
            <Typography variant="body2" color={currentStep.color} fontWeight={700} mb={1.5} sx={{ opacity: 0.85 }}>
              {currentStep.subtitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, maxWidth: 400, mx: "auto" }}>
              {currentStep.description}
            </Typography>
          </Box>

          {/* Illustration */}
          <Box sx={{ my: { xs: 2, sm: 3 } }}>
            {isPersonalize ? <Illustration currentMode={mode} /> : <Illustration />}
          </Box>

          {/* Personalization controls */}
          {isPersonalize && (
            <Box sx={{ mt: 2, px: 1 }}>
              <Typography variant="body2" color="text.secondary" textAlign="center" mb={2} fontWeight={600}>
                Choose your preferred theme:
              </Typography>
              <RadioGroup
                row
                value={mode}
                onChange={() => toggleColorMode()}
                sx={{ justifyContent: "center", gap: 2 }}
              >
                <FormControlLabel
                  value="light"
                  control={
                    <Radio
                      sx={{ color: "#0B57D0", "&.Mui-checked": { color: "#0B57D0" } }}
                    />
                  }
                  label={
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <LightModeIcon sx={{ fontSize: 18, color: "#F59E0B" }} />
                      <Typography variant="body2" fontWeight={600}>Light</Typography>
                    </Stack>
                  }
                />
                <FormControlLabel
                  value="dark"
                  control={
                    <Radio
                      sx={{ color: "#A8C7FA", "&.Mui-checked": { color: "#A8C7FA" } }}
                    />
                  }
                  label={
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <DarkModeIcon sx={{ fontSize: 18, color: "#A8C7FA" }} />
                      <Typography variant="body2" fontWeight={600}>Dark</Typography>
                    </Stack>
                  }
                />
              </RadioGroup>
            </Box>
          )}

          {/* Feature highlights */}
          {highlights && (
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ justifyContent: "center", gap: 1, mt: 2 }}>
              {highlights.map((h, i) => (
                <Box
                  key={i}
                  sx={{
                    px: 1.75, py: 0.6, borderRadius: "20px",
                    bgcolor: alpha(currentStep.color, isDark ? 0.15 : 0.08),
                    color: currentStep.color,
                    border: `1px solid ${alpha(currentStep.color, 0.2)}`,
                    display: "flex", alignItems: "center", gap: 0.5,
                  }}
                >
                  <Typography variant="caption" fontWeight={700}>{h}</Typography>
                </Box>
              ))}
            </Stack>
          )}

          {/* Final step CTA */}
          {isFinal && (
            <Stack spacing={1.5} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<NoteAddIcon />}
                onClick={() => handleFinish("create")}
                sx={{
                  borderRadius: "14px",
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1rem",
                  background: `linear-gradient(135deg, #0B57D0 0%, #7C3AED 100%)`,
                  boxShadow: "0 6px 24px rgba(11,87,208,0.35)",
                  "&:hover": {
                    background: `linear-gradient(135deg, #0842A0 0%, #6D28D9 100%)`,
                    transform: "translateY(-1px)",
                    boxShadow: "0 8px 28px rgba(11,87,208,0.45)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Create My First Note
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<DashboardIcon />}
                onClick={() => handleFinish("dashboard")}
                sx={{
                  borderRadius: "14px",
                  py: 1.4,
                  fontWeight: 600,
                  borderColor: "divider",
                  color: "text.secondary",
                  "&:hover": { borderColor: "primary.main", color: "primary.main" },
                }}
              >
                Go to Dashboard
              </Button>
            </Stack>
          )}
        </Box>

        {/* Navigation footer */}
        {!isFinal && (
          <Box
            sx={{
              px: { xs: 2.5, sm: 4 }, pb: { xs: 3, sm: 3.5 }, pt: 0,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderTop: "1px solid", borderColor: "divider",
              bgcolor: isDark ? alpha("#fff", 0.01) : alpha("#000", 0.01),
            }}
          >
            {/* Back button */}
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={goBack}
              disabled={step === 0}
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                opacity: step === 0 ? 0 : 1,
                pointerEvents: step === 0 ? "none" : "auto",
                "&:hover": { bgcolor: alpha("#000", 0.04) },
              }}
            >
              Back
            </Button>

            {/* Skip */}
            <Button
              variant="text"
              size="small"
              onClick={handleSkip}
              sx={{ color: "text.disabled", fontWeight: 500, fontSize: "0.8rem" }}
            >
              Skip tour
            </Button>

            {/* Next button */}
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={goNext}
              sx={{
                borderRadius: "12px",
                fontWeight: 700,
                px: 3,
                bgcolor: currentStep.color,
                "&:hover": { bgcolor: currentStep.color, filter: "brightness(0.88)" },
                boxShadow: `0 4px 14px ${alpha(currentStep.color, 0.35)}`,
                transition: "all 0.2s ease",
              }}
            >
              {step === totalSteps - 2 ? "Let's go!" : "Next"}
            </Button>
          </Box>
        )}
      </Dialog>
    </>
  );
};

export default OnboardingWizardModal;
