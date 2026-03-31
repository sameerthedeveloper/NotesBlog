import React from "react";
import { Outlet, Navigate, Link } from "react-router-dom";
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  useTheme, 
  Stack, 
  alpha,
  Button
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { ArrowBack as BackIcon } from "@mui/icons-material";

const AuthLayout = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
        "&::before": {
            content: '""',
            position: "absolute",
            width: "120%",
            height: "120%",
            top: "-10%",
            left: "-10%",
            background: mode => mode === 'light' 
                ? `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 40%),
                   radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 40%)`
                : `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 40%),
                   radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 40%)`,
        }
      }}
    >
      <Container maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={4} alignItems="center">
            <Stack spacing={1} alignItems="center">
                <Typography 
                    variant="h2" 
                    component="h1" 
                    sx={{ 
                        fontWeight: 900, 
                        letterSpacing: "-2.5px", 
                        color: "primary.main",
                        textAlign: "center",
                        lineHeight: 1
                    }}
                >
                    Notes Spot
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500} sx={{ textAlign: "center", opacity: 0.8 }}>
                    Capture Ideas. Share Wisdom. Everywhere.
                </Typography>
            </Stack>

            <Paper
                elevation={0}
                sx={{
                    p: { xs: 4, sm: 6 },
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderRadius: 1,
                    border: '1.5px solid',
                    borderColor: 'divider',
                    bgcolor: mode => mode === 'light' ? alpha('#ffffff', 0.8) : alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: "blur(12px)",
                    boxShadow: theme.shadows[8]
                }}
            >
                <Outlet />
            </Paper>

            <Button 
                component={Link} 
                to="/note/sample" // Just a dummy link for now or handle redirectly
                variant="text" 
                color="inherit" 
                startIcon={<BackIcon />}
                sx={{ opacity: 0.6, fontWeight: 700 }}
            >
                Back to Home
            </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default AuthLayout;
