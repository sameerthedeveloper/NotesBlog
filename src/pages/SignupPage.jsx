import React, { useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
  Collapse,
  Alert,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

/* -------- helpers -------- */
const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const PASSWORD_RULES = [
  { id: "length",  label: "At least 8 characters",  test: (p) => p.length >= 8 },
  { id: "upper",   label: "One uppercase letter",    test: (p) => /[A-Z]/.test(p) },
  { id: "lower",   label: "One lowercase letter",    test: (p) => /[a-z]/.test(p) },
  { id: "number",  label: "One number",              test: (p) => /\d/.test(p) },
  { id: "special", label: "One special character",   test: (p) => /[!@#$%^&*(),.?":{}|<>\-_+=~`]/.test(p) },
];

const getStrength = (p) => {
  if (!p) return { score: 0, label: "", color: "grey.400" };
  const n = PASSWORD_RULES.filter((r) => r.test(p)).length;
  const levels = [
    null,
    { score: 20, label: "Very weak",   color: "error.main" },
    { score: 40, label: "Weak",        color: "warning.main" },
    { score: 60, label: "Fair",        color: "info.main" },
    { score: 80, label: "Strong",      color: "success.light" },
    { score: 100, label: "Very strong", color: "success.main" },
  ];
  return levels[n] || levels[1];
};

/* -------- shared social button (matches login) -------- */
const SocialButton = ({ icon, label, onClick, disabled, loading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={onClick}
      disabled={disabled}
      startIcon={loading ? <CircularProgress size={15} color="inherit" /> : icon}
      sx={{
        py: 1.5,
        borderRadius: 2,
        fontWeight: 600,
        fontSize: "0.85rem",
        letterSpacing: 0,
        borderColor: isDark ? alpha("#fff", 0.12) : alpha("#000", 0.1),
        color: "text.primary",
        bgcolor: isDark ? alpha("#fff", 0.03) : alpha("#000", 0.01),
        textTransform: "none",
        "&:hover": {
          bgcolor: isDark ? alpha("#fff", 0.07) : alpha("#000", 0.04),
          borderColor: isDark ? alpha("#fff", 0.22) : alpha("#000", 0.2),
          transform: "translateY(-1px)",
          boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)",
        },
        transition: "all 0.18s ease",
      }}
    >
      {label}
    </Button>
  );
};

/* -------- component -------- */
const SignupPage = () => {
  const theme = useTheme();
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({
    name: false, email: false, password: false, confirmPassword: false,
  });

  const handleBlur = (f) => setTouched((p) => ({ ...p, [f]: true }));

  /* derived validation */
  const nameError    = touched.name && name.trim().length < 2 ? "Name must be at least 2 characters" : "";
  const emailError   = touched.email && email && !validateEmail(email) ? "Enter a valid email address" : "";
  const rules        = useMemo(() => PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) })), [password]);
  const passwordOk   = rules.every((r) => r.passed);
  const passwordError = touched.password && password && !passwordOk ? " " : "";
  const confirmError  = touched.confirmPassword && confirmPassword && confirmPassword !== password
    ? "Passwords do not match" : "";
  const strength = getStrength(password);
  const canSubmit = name.trim() && validateEmail(email) && passwordOk && confirmPassword === password && acceptTerms;

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setTouched({ name: true, email: true, password: true, confirmPassword: true });
      if (!canSubmit) return;
      setError("");
      setLoading(true);
      try {
        await signup(email.trim(), password, name.trim());
        toast.success("Account created! Welcome to OpenNotes 🎉");
        navigate(from, { replace: true });
      } catch (err) {
        const msg =
          err?.code === "auth/email-already-in-use"
            ? "An account with this email already exists."
            : err?.message || "Account creation failed.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [canSubmit, email, password, name, signup, navigate, from]
  );

  const handleGoogleSignIn = async () => {
    setError("");
    setSocialLoading("google");
    try {
      await loginWithGoogle();
      toast.success("Welcome to OpenNotes! 🎉");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || "Google sign-in failed.");
    } finally {
      setSocialLoading(null);
    }
  };

  const isDark = theme.palette.mode === "dark";
  const disableAll = loading || Boolean(socialLoading);

  return (
    <Stack spacing={3}>
      {/* Heading */}
      <Stack spacing={0.75}>
        <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px" color="text.primary">
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500} lineHeight={1.5}>
          Free forever · No credit card required
        </Typography>
      </Stack>

      {/* Error */}
      <Collapse in={Boolean(error)} unmountOnExit>
        <Alert severity="error" onClose={() => setError("")} sx={{ borderRadius: 2, py: 0.5, fontSize: "0.8rem" }}>
          {error}
        </Alert>
      </Collapse>

      {/* Social */}
      <Stack direction="row" spacing={1.5}>
        <SocialButton
          icon={<GoogleIcon sx={{ fontSize: 18 }} />}
          label="Google"
          onClick={handleGoogleSignIn}
          disabled={disableAll}
          loading={socialLoading === "google"}
        />
        <SocialButton
          icon={<GitHubIcon sx={{ fontSize: 18 }} />}
          label="GitHub"
          disabled={disableAll}
        />
      </Stack>

      <Divider sx={{ "&::before,&::after": { borderColor: isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08) } }}>
        <Typography variant="caption" color="text.disabled" fontWeight={600} letterSpacing="0.06em" sx={{ px: 1 }}>
          or continue with email
        </Typography>
      </Divider>

      {/* Form */}
      <form onSubmit={handleSubmit} autoComplete="on" noValidate>
        <Stack spacing={2}>
          {/* Full name */}
          <TextField
            id="signup-name"
            label="Full name"
            autoComplete="name"
            autoFocus
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => handleBlur("name")}
            error={Boolean(nameError)}
            helperText={nameError}
            disabled={disableAll}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ fontSize: 18, color: nameError ? "error.main" : "text.disabled" }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Email */}
          <TextField
            id="signup-email"
            label="Email address"
            type="email"
            autoComplete="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur("email")}
            error={Boolean(emailError)}
            helperText={emailError}
            disabled={disableAll}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ fontSize: 18, color: emailError ? "error.main" : "text.disabled" }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Password */}
          <Box>
            <TextField
              id="signup-password"
              label="Create password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur("password")}
              error={Boolean(passwordError)}
              disabled={disableAll}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ fontSize: 18, color: passwordError ? "error.main" : "text.disabled" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" tabIndex={-1}>
                      {showPassword ? <VisibilityOffIcon sx={{ fontSize: 17 }} /> : <VisibilityIcon sx={{ fontSize: 17 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Strength meter */}
            {password.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Password strength
                  </Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ color: strength.color, transition: "color 0.3s" }}>
                    {strength.label}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={strength.score}
                  sx={{
                    height: 4,
                    borderRadius: 10,
                    bgcolor: isDark ? alpha("#fff", 0.08) : alpha("#000", 0.07),
                    "& .MuiLinearProgress-bar": {
                      bgcolor: strength.color,
                      borderRadius: 10,
                      transition: "width 0.4s ease, background-color 0.3s",
                    },
                  }}
                />
                {/* Rules checklist */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 0.5,
                    mt: 1.25,
                  }}
                >
                  {rules.map((r) => (
                    <Stack key={r.id} direction="row" spacing={0.6} alignItems="center">
                      {r.passed
                        ? <CheckCircleIcon sx={{ fontSize: 12, color: "success.main" }} />
                        : <UncheckedIcon sx={{ fontSize: 12, color: "text.disabled" }} />}
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.7rem",
                          fontWeight: r.passed ? 700 : 500,
                          color: r.passed ? "success.main" : "text.disabled",
                          transition: "color 0.2s",
                        }}
                      >
                        {r.label}
                      </Typography>
                    </Stack>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Confirm password */}
          <TextField
            id="signup-confirm"
            label="Confirm password"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            fullWidth
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => handleBlur("confirmPassword")}
            error={Boolean(confirmError)}
            helperText={confirmError}
            disabled={disableAll}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ fontSize: 18, color: confirmError ? "error.main" : "text.disabled" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" size="small" tabIndex={-1}>
                    {showConfirm ? <VisibilityOffIcon sx={{ fontSize: 17 }} /> : <VisibilityIcon sx={{ fontSize: 17 }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Terms */}
          <FormControlLabel
            sx={{ alignItems: "flex-start", mt: -0.5 }}
            control={
              <Checkbox
                size="small"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                sx={{ pt: 0.4 }}
              />
            }
            label={
              <Typography variant="caption" color="text.secondary" fontWeight={500} lineHeight={1.5}>
                I agree to the{" "}
                <Box component="span" sx={{ color: "primary.main", fontWeight: 700, cursor: "pointer" }}>
                  Terms of Service
                </Box>{" "}
                and{" "}
                <Box component="span" sx={{ color: "primary.main", fontWeight: 700, cursor: "pointer" }}>
                  Privacy Policy
                </Box>
              </Typography>
            }
          />

          {/* Submit */}
          <Button
            id="signup-submit"
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={disableAll}
            endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: "17px !important" }} />}
            sx={{
              mt: 0.5,
              py: 1.75,
              borderRadius: 2.5,
              fontWeight: 800,
              fontSize: "0.9rem",
              textTransform: "none",
              letterSpacing: "0.01em",
              background: `linear-gradient(130deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.85)} 100%)`,
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
              "&:hover": {
                boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                transform: "translateY(-1px)",
              },
              "&:active": { transform: "translateY(0)" },
              transition: "all 0.18s ease",
            }}
          >
            {loading ? <CircularProgress size={21} color="inherit" /> : "Create account"}
          </Button>
        </Stack>
      </form>

      {/* Login link */}
      <Typography variant="body2" align="center" color="text.secondary" fontWeight={500}>
        Already have an account?{" "}
        <Link to="/login" state={{ from }} style={{ textDecoration: "none" }}>
          <Box component="span" sx={{ color: "primary.main", fontWeight: 800, "&:hover": { textDecoration: "underline" } }}>
            Sign in
          </Box>
        </Link>
      </Typography>
    </Stack>
  );
};

export default SignupPage;
