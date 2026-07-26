import React from "react";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { ShieldAlert, Home, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 6 },
          textAlign: "center",
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          maxWidth: 520,
          width: "100%",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "error.soft",
            color: "error.main",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            border: "2px solid",
            borderColor: "error.light"
          }}
        >
          <ShieldAlert size={42} />
        </Box>

        <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em" gutterBottom color="text.primary">
          403 - Access Denied
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
          You do not have administrative permissions to view this section. Access is strictly restricted to authorized Super Administrators.
        </Typography>

        <Box
          sx={{
            p: 2,
            mb: 4,
            borderRadius: 2,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            justifyContent: "center"
          }}
        >
          <Lock size={18} style={{ opacity: 0.7 }} />
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Security Policy Enforced: Super Admin Email Validation
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          startIcon={<Home size={18} />}
          onClick={() => navigate("/dashboard")}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.2,
            fontWeight: 700,
            textTransform: "none",
            fontSize: "0.95rem"
          }}
        >
          Return to Dashboard
        </Button>
      </Paper>
    </Container>
  );
};

export default UnauthorizedPage;
