import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  TextField, 
  Button, 
  Typography, 
  Stack, 
  Divider, 
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  alpha,
  useTheme
} from "@mui/material";
import { 
    Google as GoogleIcon, 
    Email as EmailIcon, 
    Lock as LockIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      await loginWithGoogle();
      toast.success("Logged in with Google!");
      navigate("/");
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    }
  };

  return (
    <Stack spacing={4} sx={{ width: "100%", py: 1 }}>
      <Stack spacing={0.5} alignItems="center">
          <Typography variant="h4" fontWeight={900} letterSpacing="-2px">Welcome Back</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ opacity: 0.6 }}>Please sign in to your workspace</Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ borderRadius: 1 }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
            <TextField
                fullWidth
                label="Member Email"
                variant="outlined"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <EmailIcon fontSize="small" color="primary" sx={{ opacity: 0.5 }} />
                        </InputAdornment>
                    ),
                    sx: { borderRadius: 1 }
                }}
            />
            
            <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <LockIcon fontSize="small" color="primary" sx={{ opacity: 0.5 }} />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                            </IconButton>
                        </InputAdornment>
                    ),
                    sx: { borderRadius: 1 }
                }}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                    mt: 2, 
                    py: 2, 
                    borderRadius: 1, 
                    fontWeight: 800,
                    fontSize: '1rem'
                }}
            >
                {loading ? <CircularProgress size={24} /> : "Sign In to Space"}
            </Button>
        </Stack>
      </form>

      <Divider sx={{ my: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', letterSpacing: '0.1em' }}>CONTINUE WITH</Typography>
      </Divider>

      <Button
        fullWidth
        variant="outlined"
        size="large"
        onClick={handleGoogleSignIn}
        startIcon={<GoogleIcon />}
        sx={{ borderRadius: 1, py: 1.5, fontWeight: 700, borderColor: 'divider' }}
      >
        Google Account
      </Button>

      <Typography variant="body2" color="text.secondary" align="center" sx={{ fontWeight: 600 }}>
        Not a member yet?{" "}
        <Link to="/signup" style={{ textDecoration: "none", color: theme.palette.primary.main, fontWeight: 900 }}>
          Join the Workspace
        </Link>
      </Typography>
    </Stack>
  );
};

export default LoginPage;
