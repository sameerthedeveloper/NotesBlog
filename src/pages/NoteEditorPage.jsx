import React, { useState, useEffect, useCallback, useRef } from "react";
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
  alpha,
  useTheme,
  Breadcrumbs,
  Link as MuiLink,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControlLabel
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
  CloudDoneOutlined as SavedIcon,
  CloudSyncOutlined as SavingIcon,
  MoreVert as MoreIcon,
  ChevronLeft as ChevronLeftIcon
} from "@mui/icons-material";
import NoteEditor from "../components/NoteEditor";
import TagInput from "../components/TagInput";
import { useAuth } from "../context/AuthContext";
import { 
  createNote, 
  updateNote, 
  getNoteById, 
  deleteNote 
} from "../features/notes/services/notesService";
import { useDebounce } from "../utils/useDebounce";
import toast from "react-hot-toast";

const NoteEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const theme = useTheme();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [visibility, setVisibility] = useState("private");
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [versions, setVersions] = useState([]);
  
  const [loading, setLoading] = useState(id ? true : false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const debouncedContent = useDebounce(content, 2000);
  const debouncedTitle = useDebounce(title, 2000);
  const initialLoad = useRef(true);

  useEffect(() => {
    if (id) {
      const fetchNote = async () => {
        try {
          const note = await getNoteById(id);
          if (note) {
            if (note.authorId !== currentUser.uid) {
              toast.error("Access denied");
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
            setLastSaved(new Date());
          } else {
            toast.error("Note not found");
            navigate("/");
          }
        } catch (error) {
          toast.error("Error fetching note");
        } finally {
          setLoading(false);
          initialLoad.current = false;
        }
      }
      fetchNote();
    } else {
        initialLoad.current = false;
    }
  }, [id, currentUser.uid, navigate]);

  useEffect(() => {
    if (id && !initialLoad.current && (debouncedContent || debouncedTitle)) {
      const autoSave = async () => {
        setIsSaving(true);
        try {
          await updateNote(id, { 
            content: debouncedContent, 
            title: debouncedTitle,
            tags,
            visibility,
            isPinned,
            isFavorite
          }, { saveVersion: true });
          setLastSaved(new Date());
        } catch (error) {
          console.error("Auto-save failed", error);
        } finally {
          setIsSaving(false);
        }
      };
      autoSave();
    }
  }, [debouncedContent, debouncedTitle, id, tags, visibility, isPinned, isFavorite]);

  const handleManualSave = async () => {
    if (!title.trim() && !content.trim()) {
      toast.error("Note is empty");
      return;
    }

    setIsSaving(true);
    const noteData = {
      title,
      content,
      tags,
      visibility,
      isPinned,
      isFavorite,
      authorId: currentUser.uid,
      authorName: currentUser.displayName
    };

    try {
      if (id) {
        await updateNote(id, noteData, { saveVersion: true });
      } else {
        const newId = await createNote(noteData);
        navigate(`/note/${newId}/edit`);
      }
      setLastSaved(new Date());
      toast.success("All changes saved");
    } catch (error) {
      toast.error("Cloud sync failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    if (visibility !== "public") {
      toast.error("Change visibility to public first");
      return;
    }
    navigator.clipboard.writeText(`${window.location.origin}/note/${id}`);
    toast.success("Link copied to clipboard");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress size={40} thickness={4} color="primary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Stack spacing={3}>
        {/* Navigation & Status bar */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={() => navigate("/")} size="small" sx={{ mr: 1 }}>
              <ChevronLeftIcon />
            </IconButton>
            <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                    {isSaving ? <SavingIcon fontSize="small"  color="disabled" /> : <SavedIcon fontSize="small" color="disabled" />}
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {isSaving ? "Saving..." : lastSaved ? "Stored in cloud" : "Editing..."}
                    </Typography>
                </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title={isPinned ? "Unpin" : "Pin"}>
              <IconButton onClick={() => setIsPinned(!isPinned)} color={isPinned ? "primary" : "default"}>
                {isPinned ? <PinnedIcon /> : <UnpinnedIcon />}
              </IconButton>
            </Tooltip>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { borderRadius: 1, mt: 1 } }}>
              <MenuItem onClick={handleShare}>
                <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Share with link</ListItemText>
              </MenuItem>
              {versions.length > 0 && (
                <MenuItem onClick={() => setAnchorEl(null)}>
                  <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Revision history</ListItemText>
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={async () => {
                  if (window.confirm("Move to trash?")) {
                      await deleteNote(id);
                      navigate("/");
                  }
              }} sx={{ color: "error.main" }}>
                <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </Menu>
            <Button 
                variant={id ? "text" : "contained"} 
                onClick={handleManualSave}
                disabled={isSaving}
                sx={{ borderRadius: 1, fontWeight: 700, px: 3 }}
            >
              {id ? "Sync now" : "Create note"}
            </Button>
          </Stack>
        </Box>

        {/* Workspace */}
        <Box>
           <TextField
            fullWidth
            placeholder="Title"
            variant="standard"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            InputProps={{
              disableUnderline: true,
              sx: { 
                fontSize: { xs: "1.75rem", sm: "2.5rem" }, 
                fontWeight: 700, 
                mb: 2, 
                letterSpacing: "-0.5px",
                "& input::placeholder": { color: alpha(theme.palette.text.primary, 0.2) }
              }
            }}
          />

          <Box sx={{ mb: 4 }}>
             <TagInput tags={tags} setTags={setTags} />
          </Box>

          <Stack direction="row" spacing={3} sx={{ mb: 4, py: 1.5, px: 2, borderRadius: 2, bgcolor: alpha(theme.palette.divider, 0.1) }}>
             <FormControlLabel
                control={
                  <Switch 
                    checked={visibility === "public"} 
                    onChange={(e) => setVisibility(e.target.checked ? "public" : "private")} 
                    size="small"
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    {visibility === "public" ? <PublicIcon color="primary" fontSize="small" /> : <PrivateIcon color="disabled" fontSize="small" />}
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {visibility === "public" ? "Published to web" : "Private (only you)"}
                    </Typography>
                  </Stack>
                }
              />
          </Stack>

          <NoteEditor content={content} onUpdate={setContent} />
        </Box>
      </Stack>
    </Container>
  );
};

export default NoteEditorPage;
