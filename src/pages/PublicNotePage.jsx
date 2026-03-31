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
  useTheme
} from "@mui/material";
import { 
  ArrowBack as BackIcon, 
  ContentCopyOutlined as CopyIcon,
  VisibilityOutlined as ViewIcon,
  LoginOutlined as LoginIcon
} from "@mui/icons-material";
import { getNoteById, incrementViewCount } from "../features/notes/services/notesService";
import { format } from "date-fns";
import toast from "react-hot-toast";
import AdSense from "../components/AdSense";

const PublicNotePage = () => {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const fetchedNote = await getNoteById(id);
        if (fetchedNote && fetchedNote.visibility === "public") {
          setNote(fetchedNote);
          incrementViewCount(id).catch(err => console.error('Silent view count increment error:', err));
        } else {
          setNote(null);
        }
      } catch (error) {
        console.error("Error fetching public note", error);
        setNote(null);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

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
    </Container>
  );
};

export default PublicNotePage;
