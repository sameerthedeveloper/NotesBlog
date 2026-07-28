import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Switch, 
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Paper,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Fab,
  Alert
} from "@mui/material";
import { 
  ArrowBack as BackIcon, 
  DeleteOutline as DeleteIcon,
  ShareOutlined as ShareIcon,
  PublicOutlined as PublicIcon,
  LockOutlined as PrivateIcon,
  HistoryOutlined as HistoryIcon,
  PushPin as PinnedIcon,
  PushPinOutlined as UnpinnedIcon,
  FavoriteBorder as FavoriteIcon, 
  Favorite as FavoriteFilledIcon,
  MoreVert as MoreIcon,
  VisibilityOutlined as ViewIcon,
  Edit as EditIcon,
  Check as SaveIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import TagInput from "../components/TagInput";
import ExportMenu from "../components/ExportMenu";
import ContentRenderer from "../components/ContentRenderer";
import { useAuth } from "../context/AuthContext";
import { 
  createNote, 
  updateNote, 
  getNoteById, 
  deleteNote,
  subscribeNoteViews 
} from "../features/notes/services/notesService";
import { extractNoteMetadata } from "../utils/metadataExtractor";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

// Lazy Load Heavy TipTap Rich Text Editor for Zero Initial Reader Bundle Overhead
const LazyTipTapEditor = lazy(() => import("../components/TipTapEditor"));

export const NoteEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [visibility, setVisibility] = useState("private");
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [versions, setVersions] = useState([]);
  
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(!id); // New notes start in edit mode; existing notes start in read mode

  const [anchorEl, setAnchorEl] = useState(null);
  const [viewersDialogOpen, setViewersDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [recentViews, setRecentViews] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Load existing note
  useEffect(() => {
    if (!id) return;
    const fetchNote = async () => {
      try {
        const note = await getNoteById(id);
        if (note) {
          if (note.authorId !== currentUser.uid) {
            toast.error("You do not have permission to edit this note.");
            navigate("/");
            return;
          }
          setTitle(note.title || "");
          setContent(note.content || "");
          setTags(note.tags || []);
          setVisibility(note.visibility || "private");
          setIsPinned(note.isPinned || false);
          setIsFavorite(note.isFavorite || false);
          setVersions(note.versions || []);
        } else {
          toast.error("Note not found");
          navigate("/notes");
        }
      } catch {
        toast.error("Failed to load note");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, currentUser.uid, navigate]);

  // Track Reading Progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const totalDist = docHeight - windowHeight;
      if (totalDist > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (scrollPos / totalDist) * 100)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Subscribe to real-time viewer tracking
  useEffect(() => {
    if (!id) return;
    const unsubscribe = subscribeNoteViews(id, (views) => {
      setRecentViews(views);
    });
    return () => unsubscribe();
  }, [id]);

  // Extract Metadata for Reading Mode Stats
  const metaStats = useMemo(() => {
    return extractNoteMetadata(content);
  }, [content]);

  // Save handler
  const handleSaveContent = async (updatedHtml = content) => {
    setSaving(true);
    const noteData = {
      title: title || "Untitled Note",
      content: updatedHtml,
      tags,
      visibility,
      isPinned,
      isFavorite,
      authorId: currentUser.uid,
      authorName: currentUser.displayName || "Author"
    };

    try {
      if (id) {
        await updateNote(id, noteData, { saveVersion: true });
        toast.success("Note saved successfully!");
        if (isMobile) {
          setIsEditing(false);
        }
      } else {
        const newId = await createNote(noteData);
        toast.success("Note created!");
        navigate(`/note/${newId}`, { replace: true });
      }
    } catch {
      toast.error("Failed to save note to Firestore");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    if (visibility !== "public") {
      toast.error("Please set note visibility to 'Public' to share it.");
      return;
    }
    const publicUrl = `${window.location.origin}/note/${id}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public note link copied to clipboard!");
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNote(id);
        toast.success("Note deleted");
        navigate("/notes");
      } catch {
        toast.error("Failed to delete note");
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render Fullscreen Mobile Editor or Desktop Editor Form
  const renderEditorForm = () => (
    <Box sx={{ p: { xs: 1, sm: 0 } }}>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Note Title..."
          variant="standard"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: { xs: "1.5rem", sm: "2.25rem" },
              fontWeight: 800,
              mb: 2,
              "& input::placeholder": { color: "text.disabled" }
            }
          }}
        />

        <Box sx={{ mb: 2 }}>
          <TagInput tags={tags} setTags={setTags} />
        </Box>

        <Stack direction="row" spacing={3} alignItems="center" sx={{ p: 1.5, borderRadius: 3, bgcolor: "action.hover", width: "fit-content" }}>
          <FormControlLabel
            control={
              <Switch
                checked={visibility === "public"}
                onChange={(e) => setVisibility(e.target.checked ? "public" : "private")}
              />
            }
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                {visibility === "public" ? <PublicIcon color="primary" fontSize="small" /> : <PrivateIcon color="disabled" fontSize="small" />}
                <Typography variant="body2" fontWeight={600}>
                  {visibility === "public" ? "Public (Anyone with link)" : "Private (Only Me)"}
                </Typography>
              </Stack>
            }
          />
        </Stack>
      </Box>

      {/* Lazy Loaded TipTap Rich Text Editor */}
      <Suspense 
        fallback={
          <Paper variant="outlined" sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
              Loading Rich Text Editor...
            </Typography>
          </Paper>
        }
      >
        <LazyTipTapEditor
          initialContent={content}
          onChange={(html) => setContent(html)}
          onSave={(html) => handleSaveContent(html)}
          onMetadataExtracted={(meta) => {
            if ((!title || title.trim() === "" || title === "Untitled Note") && meta.title) {
              setTitle(meta.title);
            }
          }}
          autoSave={Boolean(id)}
        />
      </Suspense>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 2, px: { xs: 1, sm: 3 } }}>
      {/* Mobile Notice Banner */}
      {isMobile && (
        <Alert severity="info" variant="filled" sx={{ mb: 3, borderRadius: 3, fontWeight: 600 }}>
          Note creation and editing are available on desktop devices only.
        </Alert>
      )}

      {/* Sticky Top Reading Progress Bar */}
      {scrollProgress > 0 && (
        <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1400, height: 3 }}>
          <LinearProgress variant="determinate" value={scrollProgress} sx={{ height: 3 }} />
        </Box>
      )}

      {/* Mobile New Note Block */}
      {isMobile && !id ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 4, mt: 2 }}>
          <Typography variant="h6" fontWeight={700} paragraph>
            Desktop Device Required
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 460, mx: "auto" }}>
            Note creation and editing are available on desktop devices only. Please open OpenNotes on a desktop browser to create or edit notes.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/")} sx={{ borderRadius: 3, px: 3, fontWeight: 700 }}>
            Back to Dashboard
          </Button>
        </Paper>
      ) : (
        <>
          {/* Header Action Controls */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton onClick={() => navigate("/notes")} sx={{ borderRadius: 2 }}>
                  <BackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight={700} noWrap sx={{ maxWidth: { xs: 180, sm: 400 } }}>
                  {title || (id ? "Note Reader" : "Create Note")}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                {/* Toggle Edit / Read Mode Button (Desktop Only) */}
                {id && !isMobile && (
                  <Button
                    variant={isEditing ? "outlined" : "contained"}
                    startIcon={isEditing ? <CloseIcon /> : <EditIcon />}
                    onClick={() => setIsEditing(!isEditing)}
                    sx={{ borderRadius: 3, fontWeight: 700 }}
                  >
                    {isEditing ? "Done" : "Edit"}
                  </Button>
                )}

                <ExportMenu noteTitle={title || "Untitled Note"} htmlContent={content} />

                <Tooltip title={isPinned ? "Unpin Note" : "Pin Note"}>
                  <IconButton onClick={() => setIsPinned(!isPinned)} color={isPinned ? "primary" : "default"}>
                    {isPinned ? <PinnedIcon /> : <UnpinnedIcon />}
                  </IconButton>
                </Tooltip>

                <Tooltip title={isFavorite ? "Unfavorite" : "Mark Favorite"}>
                  <IconButton onClick={() => setIsFavorite(!isFavorite)} color={isFavorite ? "error" : "default"}>
                    {isFavorite ? <FavoriteFilledIcon /> : <FavoriteIcon />}
                  </IconButton>
                </Tooltip>

                {id && (
                  <Tooltip title="Real-Time Viewers">
                    <IconButton onClick={() => setViewersDialogOpen(true)} color="info">
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                )}

                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <MoreIcon />
                </IconButton>

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                  <MenuItem onClick={() => { setAnchorEl(null); handleShare(); }}>
                    <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Copy Public Link" />
                  </MenuItem>
                  {versions.length > 0 && (
                    <MenuItem onClick={() => { setAnchorEl(null); setHistoryDialogOpen(true); }}>
                      <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Version History" />
                    </MenuItem>
                  )}
                  {id && (
                    <MenuItem onClick={() => { setAnchorEl(null); handleDelete(); }} sx={{ color: "error.main" }}>
                      <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                      <ListItemText primary="Delete Note" />
                    </MenuItem>
                  )}
                </Menu>

                {isEditing && !isMobile && (
                  <Button
                    variant="contained"
                    onClick={() => handleSaveContent(content)}
                    disabled={saving}
                    sx={{ borderRadius: 3, px: 3, fontWeight: 700 }}
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>

          {/* Main Area: Reading View vs Mobile Fullscreen Editor */}
          {(!isEditing || isMobile) ? (
        /* Reading Mode */
        <Box sx={{ width: "100%", maxWidth: 900, mx: "auto" }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" component="h1" fontWeight={800} letterSpacing="-1px" sx={{ mb: 1.5, fontSize: { xs: "2rem", sm: "3rem" } }}>
              {title || "Untitled Note"}
            </Typography>

            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ gap: 1, mb: 2 }}>
              <Chip label={`⚡ ${metaStats.readingTimeMinutes} min read`} size="small" color="primary" variant="soft" />
              <Chip label={`${metaStats.wordCount} words`} size="small" variant="outlined" />
              <Chip label={`Level: ${metaStats.difficultyLevel}`} size="small" variant="outlined" />
              <Chip label={visibility === "public" ? "Public" : "Private"} size="small" color={visibility === "public" ? "success" : "default"} />
            </Stack>

            {tags.length > 0 && (
              <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mb: 2 }}>
                {tags.map((t, idx) => (
                  <Chip key={idx} label={`#${t}`} size="small" sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            )}

            <Divider sx={{ my: 3 }} />
          </Box>

          {/* Render Sanitized HTML Content */}
          <ContentRenderer content={content} />

          {/* Floating Mobile Edit Button */}
          {isMobile && (
            <Fab
              color="primary"
              variant="extended"
              onClick={() => setIsEditing(true)}
              sx={{
                position: "fixed",
                bottom: 80,
                right: 20,
                zIndex: 1250,
                borderRadius: 4,
                px: 3,
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
              }}
            >
              <EditIcon sx={{ mr: 1 }} /> Edit Note
            </Fab>
          )}
        </Box>
      ) : isMobile ? (
        /* Fullscreen Mobile Editor Dialog */
        <Dialog fullScreen open={isEditing} onClose={() => setIsEditing(false)}>
          <Paper elevation={0} sx={{ p: 2, borderBottom: 1, borderColor: "divider", borderRadius: 0 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton onClick={() => setIsEditing(false)}>
                  <BackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight={700}>
                  {id ? "Edit Note" : "New Note"}
                </Typography>
              </Stack>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSaveContent(content)}
                disabled={saving}
                sx={{ borderRadius: 3, fontWeight: 700 }}
              >
                {saving ? "Saving..." : "Done"}
              </Button>
            </Stack>
          </Paper>
          <Box sx={{ p: 2, overflowY: "auto", flexGrow: 1 }}>
            {renderEditorForm()}
          </Box>
        </Dialog>
      ) : (
        /* Desktop Editor */
        renderEditorForm()
      )}

      {/* Viewers Analytics Dialog */}
      <Dialog open={viewersDialogOpen} onClose={() => setViewersDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Recent Viewers & Analytics</DialogTitle>
        <DialogContent dividers>
          {recentViews.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No viewers recorded yet.
            </Typography>
          ) : (
            <List>
              {recentViews.map((v) => (
                <ListItem key={v.id}>
                  <ListItemAvatar>
                    <Avatar src={v.photoURL || ""}>{v.displayName?.charAt(0) || "V"}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={v.displayName || "Anonymous Viewer"}
                    secondary={v.viewedAt ? `Viewed ${formatDistanceToNow(v.viewedAt.toDate ? v.viewedAt.toDate() : new Date(v.viewedAt))} ago` : "Just now"}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewersDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Note Version History</DialogTitle>
        <DialogContent dividers>
          {versions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No previous versions recorded.
            </Typography>
          ) : (
            <List>
              {versions.map((ver, idx) => (
                <ListItem 
                  key={idx}
                  secondaryAction={
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => {
                        setContent(ver.content || "");
                        setTitle(ver.title || title);
                        setHistoryDialogOpen(false);
                        toast.success("Restored version from history!");
                      }}
                    >
                      Restore
                    </Button>
                  }
                >
                  <ListItemText
                    primary={ver.title || `Version ${versions.length - idx}`}
                    secondary={ver.timestamp ? `Saved ${formatDistanceToNow(ver.timestamp.toDate ? ver.timestamp.toDate() : new Date(ver.timestamp))} ago` : `Version #${idx + 1}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
        </>
      )}
    </Container>
  );
};

export default NoteEditorPage;
