import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Avatar, 
  TextField, 
  Button, 
  Divider,
  CircularProgress,
  Alert,
  Stack,
  alpha,
  useTheme,
  Grid
} from "@mui/material";
import { 
    Person as PersonIcon, 
    Email as EmailIcon, 
    Badge as BadgeIcon,
    Save as SaveIcon
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { createUserProfile } from "../features/notes/services/notesService";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  
  const [name, setName] = useState(currentUser?.displayName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createUserProfile(currentUser.uid, { name });
      toast.success("Settings updated!");
    } catch (err) {
      setError(err.message || "Failed to update profile");
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Stack spacing={6}>
        <Box sx={{ mb: 2 }}>
            <Typography variant="h2" fontWeight={800} gutterBottom letterSpacing="-2px">
                Settings
            </Typography>
            <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ opacity: 0.8 }}>
                Customize your workspace and personal preferences.
            </Typography>
        </Box>

        <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 4 }}>
                <Paper 
                    variant="outlined"
                    sx={{ 
                        p: 4, 
                        textAlign: "center", 
                        borderRadius: 1,
                        backgroundColor: isLight ? alpha(theme.palette.primary.main, 0.02) : alpha(theme.palette.primary.main, 0.05),
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <Avatar 
                        src={currentUser?.photoURL || ""} 
                        alt={currentUser?.displayName || "User"}
                        sx={{ 
                            width: 140, 
                            height: 140, 
                            mb: 3, 
                            fontSize: "4rem", 
                            fontWeight: 800,
                            bgcolor: "primary.main",
                            color: isLight ? '#FFFFFF' : '#381E72',
                            boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.05)}`
                        }}
                    >
                        {currentUser?.displayName?.charAt(0) || "U"}
                    </Avatar>
                    <Typography variant="h5" fontWeight={800} letterSpacing="-1px">
                        {currentUser?.displayName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, opacity: 0.6, mt: 0.5 }}>
                        {currentUser?.email}
                    </Typography>
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
                <Paper 
                    variant="outlined"
                    sx={{ 
                        p: 5, 
                        borderRadius: 1, // 24px
                        backgroundColor: theme.palette.background.paper,
                        borderColor: 'divider'
                    }}
                >
                    <Typography variant="h6" fontWeight={800} gutterBottom>
                        Account Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 5, fontWeight: 500 }}>
                        Update how your name appears in shared notes and notifications.
                    </Typography>
                    
                    <Box component="form" onSubmit={handleUpdate}>
                        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 1 }}>{error}</Alert>}
                        
                        <Stack spacing={4}>
                            <TextField
                                fullWidth
                                label="Workspace Name"
                                variant="outlined"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <BadgeIcon sx={{ mr: 1, color: 'primary.main', opacity: 0.5 }} fontSize="small" />
                                    ),
                                    sx: { borderRadius: 1 }
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Member Email"
                                variant="outlined"
                                disabled
                                value={currentUser?.email || ""}
                                InputProps={{
                                    startAdornment: (
                                        <EmailIcon sx={{ mr: 1, color: 'text.disabled', opacity: 0.5 }} fontSize="small" />
                                    ),
                                    sx: { borderRadius: 1 }
                                }}
                            />

                            <Box sx={{ pt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                    sx={{ 
                                        borderRadius: 1, 
                                        px: 6,
                                        py: 2,
                                        fontWeight: 800,
                                        fontSize: '1rem'
                                    }}
                                >
                                    Save Profile
                                </Button>
                            </Box>
                        </Stack>
                    </Box>
                </Paper>

                <Paper 
                    variant="outlined"
                    sx={{ 
                        p: 5, 
                        mt: 4,
                        borderRadius: 1,
                        backgroundColor: isLight ? alpha(theme.palette.error.main, 0.01) : alpha(theme.palette.error.main, 0.05),
                        borderColor: alpha(theme.palette.error.main, 0.1),
                    }}
                >
                    <Typography variant="h6" fontWeight={800} gutterBottom color="error.main">
                        Deactivate Space
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
                        Permanently delete your member account and all of your personal notes. 
                    </Typography>
                    <Button variant="outlined" color="error" sx={{ borderRadius: 1, px: 4, fontWeight: 800 }}>
                        Delete Forever
                    </Button>
                </Paper>
            </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default ProfilePage;
