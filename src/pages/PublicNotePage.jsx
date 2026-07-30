import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Container, 
  CircularProgress, 
  Divider,
  Avatar,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Chip
} from "@mui/material";
import { 
  ArrowBack as BackIcon, 
  ContentCopyOutlined as CopyIcon,
  VisibilityOutlined as ViewIcon,
  LoginOutlined as LoginIcon,
  EditOutlined as EditIcon
} from "@mui/icons-material";
import { subscribeNoteById, incrementViewCount } from "../features/notes/services/notesService";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import HtmlViewer from "../components/HtmlViewer";
import ExportMenu from "../components/ExportMenu";
import AdPlacement from "../features/monetization/components/AdPlacement";
import NoteDiscussionForum from "../features/discussions/components/NoteDiscussionForum";

export const PublicNotePage = () => {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  const { userProfile, currentUser } = useAuth();
  const [isNamePromptOpen, setIsNamePromptOpen] = useState(false);
  const [visitorName, setVisitorName] = useState("");

  useEffect(() => {
    let hasIncremented = false;
    const unsubscribe = subscribeNoteById(id, (fetchedNote) => {
      if (fetchedNote && fetchedNote.visibility === "public") {
        setNote(fetchedNote);
        setLoading(false);
        
        if (!hasIncremented) {
          if (userProfile) {
            incrementViewCount(id, userProfile).catch(err => console.error('View increment error:', err));
            hasIncremented = true;
          } else {
             const storedName = localStorage.getItem("guest_viewer_name");
             const storedId = localStorage.getItem("guest_viewer_id");
             
             if (storedName) {
                incrementViewCount(id, { 
                    uid: storedId || "guest_" + Date.now(), 
                    displayName: storedName 
                }).catch(err => console.error('View increment error:', err));
                hasIncremented = true;
             } else {
                setIsNamePromptOpen(true);
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
    
    localStorage.setItem("guest_viewer_name", trimmedName);
    localStorage.setItem("guest_viewer_id", guestId);
    
    incrementViewCount(id, { 
        uid: guestId, 
        displayName: trimmedName 
    }).catch(err => console.error('View increment error:', err));
    
    setIsNamePromptOpen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Public note link copied!");
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
      <Container maxWidth="sm" sx={{ textAlign: "center", mt: 12 }}>
        <Typography variant="h4" fontWeight={800} mb={2}>Note Unavailable</Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          This note does not exist or was made private by the author.
        </Typography>
        <Button variant="contained" component={Link} to="/" startIcon={<LoginIcon />} sx={{ borderRadius: 3, px: 4 }}>
          Go to Home
        </Button>
      </Container>
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
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Back to Application
          </Button>

          <Stack direction="row" spacing={1.5}>
            {currentUser?.uid === note.authorId && (
              <Button
                variant="outlined"
                component={Link}
                to={`/note/${note.id}/edit`}
                startIcon={<EditIcon />}
                sx={{ borderRadius: 3, fontWeight: 700 }}
              >
                Edit Note
              </Button>
            )}
            <ExportMenu noteTitle={note.title || "Untitled Document"} htmlContent={note.content} />
            <Button 
              variant="contained" 
              onClick={handleCopyLink} 
              startIcon={<CopyIcon />}
              sx={{ borderRadius: 3, fontWeight: 700, px: 3 }}
            >
              Share Link
            </Button>
          </Stack>
        </Box>

        <Box>
            <Typography 
              variant="h1" 
              gutterBottom 
              sx={{ 
                  fontSize: { xs: "2.2rem", sm: "3.5rem" }, 
                  fontWeight: 800, 
                  letterSpacing: "-0.03em", 
                  lineHeight: 1.15,
                  mb: 3
              }}
            >
                {note.title || "Untitled Document"}
            </Typography>
            
            <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: "primary.main", fontWeight: 700 }}>
                    {note.authorName?.charAt(0) || "U"}
                </Avatar>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700}>{note.authorName || "Author"}</Typography>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                            Updated {note.updatedAt?.toDate ? format(note.updatedAt.toDate(), "MMM dd, yyyy") : "Recently"}
                        </Typography>
                        <Divider orientation="vertical" flexItem sx={{ height: 12, my: "auto" }} />
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <ViewIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="caption" fontWeight={700} color="text.secondary">
                                {note.viewCount || 0} views
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>

            {note.tags && note.tags.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 4 }}>
                {note.tags.map((t) => (
                  <Chip key={t} label={`#${t}`} size="small" variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }} />
                ))}
              </Stack>
            )}

            {/* Creator AdPlacement: Above Article */}
            <AdPlacement placement="above_article" creatorUid={note.authorId || note.userId} />

            {/* Sanitized HTML Content */}
            <HtmlViewer content={note.content} />

            {/* Creator AdPlacement: Below Article */}
            <AdPlacement placement="below_article" creatorUid={note.authorId || note.userId} />

            {/* Collaborative Knowledge Hub: Note Discussion Forum */}
            <NoteDiscussionForum noteId={note.id} noteAuthorId={note.authorId} />
        </Box>
      </Stack>

      {/* Guest Reader Name Modal */}
      <Dialog 
        open={isNamePromptOpen} 
        disableEscapeKeyDown
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Welcome to OpenNotes Reader</DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Please enter your name to register as a reader for this document.
            </Typography>
            <TextField
                autoFocus
                fullWidth
                placeholder="Your Name..."
                variant="outlined"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitVisitorName()}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button 
                fullWidth 
                variant="contained" 
                onClick={handleSubmitVisitorName}
                sx={{ borderRadius: 2, py: 1.2, fontWeight: 700 }}
            >
                Start Reading
            </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PublicNotePage;
