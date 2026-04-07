import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  CircularProgress, 
  Divider,
  Avatar,
  Stack,
  Button,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions
} from "@mui/material";
import { 
  ArrowBack as BackIcon, 
  ContentCopyOutlined as CopyIcon,
  VisibilityOutlined as ViewIcon,
  LoginOutlined as LoginIcon
} from "@mui/icons-material";
import { subscribeNoteById, incrementViewCount } from "../features/notes/services/notesService";
import { format } from "date-fns";
import toast from "react-hot-toast";
import AdSense from "../components/AdSense";
import { useAuth } from "../context/AuthContext";

const PublicNotePage = () => {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const { userProfile } = useAuth();
  const [isNamePromptOpen, setIsNamePromptOpen] = useState(false);
  const [visitorName, setVisitorName] = useState("");

  useEffect(() => {
    let hasIncremented = false;
    const unsubscribe = subscribeNoteById(id, (fetchedNote) => {
      if (fetchedNote && fetchedNote.visibility === "public") {
        setNote(fetchedNote);
        setLoading(false);
        
        // Handle increment logic
        if (!hasIncremented) {
          if (userProfile) {
            // Priority 1: User Profile
            incrementViewCount(id, userProfile).catch(err => console.error('View increment error:', err));
            hasIncremented = true;
          } else {
             // Priority 2: Guest tracking from LocalStorage
             const storedName = localStorage.getItem("guest_viewer_name");
             const storedId = localStorage.getItem("guest_viewer_id");
             
             if (storedName) {
                incrementViewCount(id, { 
                    uid: storedId || "guest_" + Date.now(), 
                    displayName: storedName 
                }).catch(err => console.error('View increment error:', err));
                hasIncremented = true;
             } else {
                // Priority 3: Prompt for name if none found
                setIsNamePromptOpen(true);
                // We'll increment after the prompt is submitted
             }
          }
        }
      } else {
        setNote(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id, userProfile]);

  const handleSubmitVisitorName = () => {
    const trimmedName = visitorName.trim() || "Guest Reader";
    const guestId = "guest_" + Date.now();
    
    // Save for future visits
    localStorage.setItem("guest_viewer_name", trimmedName);
    localStorage.setItem("guest_viewer_id", guestId);
    
    // Increment count
    incrementViewCount(id, { 
        uid: guestId, 
        displayName: trimmedName 
    }).catch(err => console.error('View increment error:', err));
    
    setIsNamePromptOpen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  if (!note) {
    return (
      <Box sx={{ textAlign: "center", mt: 16 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-2px' }}>Access denied</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 6, fontWeight: 500, opacity: 0.6 }}>
          This note is no longer available or was made private by the author.
        </Typography>
        <Button 
          variant="contained" 
          component={Link} 
          to="/login" 
          startIcon={<LoginIcon />}
          sx={{ borderRadius: 1, px: 6, py: 1.5, fontWeight: 700 }}
        >
          Sign in to your space
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, sm: 8 } }}>
      <Stack spacing={4}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button 
            variant="text" 
            component={Link} 
            to="/" 
            startIcon={<BackIcon />} 
            sx={{ fontWeight: 700, borderRadius: 1, px: 3, color: 'text.secondary' }}
          >
            My notes
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCopyLink} 
            startIcon={<CopyIcon />}
            sx={{ borderRadius: 1, fontWeight: 700, px: 4 }}
          >
            Copy link
          </Button>
        </Box>

        <Box>
            <Typography variant="h1" gutterBottom 
                sx={{ 
                    fontSize: { xs: "2.5rem", sm: "4rem" }, 
                    fontWeight: 800, 
                    letterSpacing: "-2.5px", 
                    lineHeight: 1.1,
                    mb: 5
                }}
            >
                {note.title || "Untitled Document"}
            </Typography>
            
            <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 6 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ 
                        width: 48, 
                        height: 48, 
                        bgcolor: "primary.main", 
                        fontSize: '1.25rem', 
                        fontWeight: 800,
                    }}>
                        {note.authorName?.charAt(0) || "U"}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{note.authorName || "Guest Member"}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, opacity: 0.6 }}>
                                Shared on {note.updatedAt ? format(note.updatedAt.toDate(), "MMM dd, yyyy") : "Recently"}
                            </Typography>
                            <Divider orientation="vertical" flexItem sx={{ height: 12, my: "auto", borderRightWidth: 1.5 }} />
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <ViewIcon sx={{ fontSize: 14, opacity: 0.6 }} />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                    {note.viewCount || 0} READS
                                </Typography>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </Stack>

            <Box 
                dangerouslySetInnerHTML={{ __html: note.content }} 
                sx={{ 
                    fontSize: "1.125rem",
                    lineHeight: 1.8,
                    fontWeight: 500,
                    color: 'text.primary',
                    "& h1": { fontSize: "2.5rem", fontWeight: 800, mb: 3, letterSpacing: "-1.5px" },
                    "& h2": { fontSize: "2rem", fontWeight: 700, mb: 2, letterSpacing: "-0.75px" },
                    "& blockquote": { 
                        borderLeft: "6px solid", 
                        borderColor: alpha(theme.palette.primary.main, 0.3), 
                        pl: 4, 
                        py: 1,
                        my: 4,
                        fontStyle: "italic", 
                        color: "text.secondary",
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        borderRadius: '2px 12px 12px 2px'
                    },
                    "& code": {
                        backgroundColor: alpha(theme.palette.divider, 0.1),
                        padding: "4px 8px",
                        borderRadius: "8px",
                        fontFamily: "monospace",
                        fontSize: "0.95em",
                        fontWeight: 700
                    },
                    "& img": { maxWidth: "100%", height: "auto", borderRadius: 1, my: 4 }
                }}
            />

            <Divider sx={{ my: 8 }} />
            
            {/* End-of-note Monitization Block */}
            <Box sx={{ width: '100%', mb: 4, display: 'flex', justifyContent: 'center' }}>
                <AdSense adSlot="3200385772" />
            </Box>
        </Box>
      </Stack>

      <Dialog 
        open={isNamePromptOpen} 
        disableEscapeKeyDown
        PaperProps={{ sx: { borderRadius: 2, px: 1, py: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Welcome to Notes Spot</DialogTitle>
        <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: 'text.secondary' }}>
                How would you like to be remembered as a reader?
            </Typography>
            <TextField
                autoFocus
                fullWidth
                placeholder="Your name"
                variant="outlined"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitVisitorName()}
                sx={{ 
                    "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontWeight: 700 }
                }}
            />
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
            <Button 
                fullWidth 
                variant="contained" 
                onClick={handleSubmitVisitorName}
                sx={{ borderRadius: 1.5, py: 1.5, fontWeight: 800 }}
            >
                Start reading
            </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PublicNotePage;
