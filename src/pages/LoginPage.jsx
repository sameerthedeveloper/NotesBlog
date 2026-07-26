import React, { useState, useCallback } from "react";
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
  useTheme,
  alpha,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

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
        gap: 0.5,
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

const LoginPage = () => {
  const theme = useTheme();
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailError = touched.email && email && !validateEmail(email) ? "Please enter a valid email" : "";
  const passwordError = touched.password && password.length > 0 && password.length < 6 ? "Password must be at least 6 characters" : "";
  const handleBlur = (field) => setTouched((p) => ({ ...p, [field]: true }));

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setTouched({ email: true, password: true });
      if (!validateEmail(email)) return;
      setError("");
      setLoading(true);
      try {
        await login(email.trim(), password);
        toast.success("Welcome back! 👋");
        navigate(from, { replace: true });
      } catch (err) {
        const code = err?.code;
        const msg =
          code === "auth/invalid-credential" || code === "auth/wrong-password"
            ? "Incorrect email or password."
            : code === "auth/user-not-found"
            ? "No account found with this email."
            : code === "auth/too-many-requests"
            ? "Too many attempts. Please try again later."
            : err?.message || "Sign in failed. Please try again.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [email, password, login, navigate, from]
  );

  const handleGoogleSignIn = async () => {
    setError("");
    setSocialLoading("google");
    try {
      await loginWithGoogle();
      toast.success("Welcome! 🎉");
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
    <Stack spacing={3.5}>
      {/* Heading */}
      <Stack spacing={0.75}>
        <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px" color="text.primary">
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500} lineHeight={1.5}>
          Sign in to continue to OpenNotes
        </Typography>
      </Stack>

      {/* Error alert */}
      <Collapse in={Boolean(error)} unmountOnExit>
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ borderRadius: 2, py: 0.5, fontSize: "0.8rem" }}
        >
          {error}
        </Alert>
      </Collapse>

      {/* Social sign-in */}
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

      {/* Divider */}
      <Divider sx={{ "&::before,&::after": { borderColor: isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08) } }}>
        <Typography variant="caption" color="text.disabled" fontWeight={600} letterSpacing="0.06em" sx={{ px: 1 }}>
          or continue with email
        </Typography>
      </Divider>

      {/* Form */}
      <form onSubmit={handleSubmit} autoComplete="on" noValidate>
        <Stack spacing={2}>
          <TextField
            id="login-email"
            label="Email address"
            type="email"
            autoComplete="email"
            autoFocus
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

          <Box>
            <TextField
              id="login-password"
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur("password")}
              error={Boolean(passwordError)}
              helperText={passwordError}
              disabled={disableAll}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ fontSize: 18, color: passwordError ? "error.main" : "text.disabled" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword
                        ? <VisibilityOffIcon sx={{ fontSize: 17 }} />
                        : <VisibilityIcon sx={{ fontSize: 17 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Remember me + Forgot password */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: -0.5 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{ p: 0.5 }}
                />
              }
              label={
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  Remember me
                </Typography>
              }
              sx={{ ml: -0.5 }}
            />
            <Link to="/forgot-password" style={{ textDecoration: "none" }}>
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ color: "primary.main", "&:hover": { textDecoration: "underline" } }}
              >
                Forgot password?
              </Typography>
            </Link>
          </Stack>

          {/* Submit */}
          <Button
            id="login-submit"
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={disableAll}
            endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: "17px !important" }} />}
            sx={{
              mt: 1,
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
              "&:active": { transform: "translateY(0px)" },
              transition: "all 0.18s ease",
            }}
          >
            {loading ? <CircularProgress size={21} color="inherit" /> : "Sign in"}
          </Button>
        </Stack>
      </form>

      {/* Sign up */}
      <Typography variant="body2" align="center" color="text.secondary" fontWeight={500}>
        Don&apos;t have an account?{" "}
        <Link to="/signup" state={{ from }} style={{ textDecoration: "none" }}>
          <Box
            component="span"
            sx={{
              color: "primary.main",
              fontWeight: 800,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Create account
          </Box>
        </Link>
      </Typography>
    </Stack>
  );
};

export default LoginPage;
