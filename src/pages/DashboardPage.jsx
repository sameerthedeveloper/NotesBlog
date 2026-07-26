import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Skeleton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  alpha
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  PushPin as PinnedIcon,
  Favorite as FavoriteIcon,
  Notes as NotesIcon,
  Visibility as ViewIcon,
  GridView as GridViewIcon,
  FormatListBulleted as ListViewIcon,
  AutoFixHigh as MigrateIcon,
  ChevronRight as ChevronRightIcon,
  DescriptionOutlined as DocIcon,
  MoreVert as MoreVertIcon,
  ShareOutlined as ShareIcon,
  DeleteOutline as DeleteIcon
} from "@mui/icons-material";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { subscribeUserNotes, deleteNote, togglePin, toggleFavorite } from "../features/notes/services/notesService";
import NoteCard from "../components/NoteCard";
import NoteCardGrid from "../components/NoteCardGrid";
import { runNotesMigration } from "../utils/migration";
import { stripHtmlTags } from "../utils/sanitizer";
import { extractNoteMetadata } from "../utils/metadataExtractor";
import toast from "react-hot-toast";

// Mini Sparkline SVG Components for Overview Cards
const BlueSparkline = () => (
  <svg width="70" height="22" viewBox="0 0 70 22" fill="none">
    <path d="M2 18 Q 20 14, 35 10 T 55 6 T 68 2" stroke="#0B57D0" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

const PurpleSparkline = () => (
  <svg width="70" height="22" viewBox="0 0 70 22" fill="none">
    <path d="M2 20 Q 18 8, 35 14 T 55 6 T 68 4" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

const RedSparkline = () => (
  <svg width="70" height="22" viewBox="0 0 70 22" fill="none">
    <path d="M2 18 Q 22 20, 40 10 T 58 8 T 68 2" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

const TealSparkline = () => (
  <svg width="70" height="22" viewBox="0 0 70 22" fill="none">
    <path d="M2 16 Q 25 14, 45 6 T 60 10 T 68 2" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

export const DashboardPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");

  const [migrating, setMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState({ current: 0, total: 0, msg: "" });

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeUserNotes(currentUser.uid, {}, (userNotes) => {
      setNotes(userNotes);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      toast.success("Note deleted successfully");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const handleTogglePin = async (noteId, currentStatus) => {
    try {
      await togglePin(noteId, !currentStatus);
    } catch {
      toast.error("Failed to update pin status");
    }
  };

  const handleToggleFavorite = async (noteId, currentStatus) => {
    try {
      await toggleFavorite(noteId, !currentStatus);
    } catch {
      toast.error("Failed to update favorite status");
    }
  };

  const handleRunMigration = async () => {
    setMigrating(true);
    try {
      const res = await runNotesMigration((cur, tot, msg) => {
        setMigrationProgress({ current: cur, total: tot, msg });
      });
      toast.success(`Migration completed! ${res.converted} notes converted to HTML.`);
    } catch (err) {
      console.error(err);
      toast.error("Migration failed");
    } finally {
      setMigrating(false);
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (filterType === "pinned" && !n.isPinned) return false;
    if (filterType === "favorites" && !n.isFavorite) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = n.title?.toLowerCase().includes(q);
      const tagMatch = n.tags?.some((t) => t.toLowerCase().includes(q));
      const contentMatch = n.content?.toLowerCase().includes(q);
      return titleMatch || tagMatch || contentMatch;
    }
    return true;
  });

  const totalViews = notes.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);
  const pinnedCount = notes.filter((n) => n.isPinned).length;
  const favoriteCount = notes.filter((n) => n.isFavorite).length;

  const handleMenuOpen = (e, noteId) => {
    e.stopPropagation();
    setSelectedNoteId(noteId);
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNoteId(null);
  };

  const renderOverviewCard = (title, count, icon, sparkline, iconBg, iconColor) => (
    <Paper
      variant="outlined"
      sx={{
        p: 2.25,
        borderRadius: 3,
        minHeight: 128,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        bgcolor: "background.paper",
        borderColor: "divider",
        transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "primary.main",
          boxShadow: (theme) => theme.palette.mode === "dark" 
            ? "0 10px 24px rgba(0,0,0,0.3)" 
            : "0 10px 24px rgba(11,87,208,0.08)"
        }
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box 
          sx={{ 
            width: 38,
            height: 38,
            borderRadius: 2.5, 
            bgcolor: iconBg, 
            color: iconColor, 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 20 } })}
        </Box>
        <Box sx={{ width: 70, height: 22, opacity: 0.35, pointerEvents: "none" }}>
          {sparkline}
        </Box>
      </Stack>

      <Box sx={{ mt: 1 }}>
        <Typography 
          variant="h4" 
          fontWeight={700} 
          sx={{ 
            fontSize: "1.85rem", 
            lineHeight: 1.1, 
            letterSpacing: "-0.02em",
            color: "text.primary" 
          }}
        >
          {count}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          fontWeight={500} 
          sx={{ 
            fontSize: "0.85rem", 
            opacity: 0.85,
            mt: 0.25
          }}
        >
          {title}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ width: "100%", pb: { xs: 8, sm: 4 } }}>
      {/* Dashboard Header */}
      <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <Box>
          <Typography 
            variant="h4" 
            fontWeight={800} 
            letterSpacing="-0.5px" 
            sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" } }}
          >
            Welcome back, {currentUser?.displayName?.split(" ")[0] || "User"}! 👋
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, opacity: 0.85 }}>
            Manage, edit, and share your rich HTML notes.
          </Typography>
        </Box>

        {/* Desktop Quick Actions */}
        {!isMobile && (
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<MigrateIcon />}
              onClick={handleRunMigration}
              disabled={migrating}
              sx={{ borderRadius: 3, fontWeight: 600 }}
            >
              Auto Convert Markdown
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/note/new")}
              sx={{ borderRadius: 3, px: 3, fontWeight: 700 }}
            >
              New Note
            </Button>
          </Stack>
        )}
      </Box>

      {/* Mobile Quick Action Cards (Visible only on mobile) */}
      {isMobile && (
        <Stack direction="row" spacing={2} sx={{ mb: 3.5, width: "100%" }}>
          <Paper
            variant="outlined"
            onClick={handleRunMigration}
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 4,
              cursor: "pointer",
              bgcolor: theme.palette.mode === "dark" ? "rgba(11, 87, 208, 0.12)" : "#EFF6FF",
              borderColor: alpha(theme.palette.primary.main, 0.2),
              transition: "all 0.2s ease",
              "&:active": { transform: "scale(0.98)" },
              "&:hover": { borderColor: "primary.main" }
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box 
                sx={{ 
                  p: 1, 
                  borderRadius: 3, 
                  bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#FFFFFF", 
                  color: "primary.main",
                  display: "flex",
                  flexShrink: 0
                }}
              >
                <MigrateIcon fontSize="small" />
              </Box>
              <Box noWrap sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={700} color="primary.main" noWrap sx={{ fontSize: "0.85rem" }}>
                  Auto Convert
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  Markdown
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper
            onClick={() => navigate("/note/new")}
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 4,
              cursor: "pointer",
              bgcolor: "primary.main",
              color: "#FFFFFF",
              boxShadow: "0 8px 24px rgba(11, 87, 208, 0.3)",
              transition: "all 0.2s ease",
              "&:active": { transform: "scale(0.98)" }
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box 
                sx={{ 
                  p: 1, 
                  borderRadius: 3, 
                  bgcolor: "rgba(255,255,255,0.2)", 
                  color: "#FFFFFF",
                  display: "flex",
                  flexShrink: 0
                }}
              >
                <AddIcon fontSize="small" />
              </Box>
              <Box noWrap sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ fontSize: "0.85rem" }}>
                  New Note
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }} noWrap display="block">
                  Create a new note
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      )}

      {/* Overview Statistics Section */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography variant="h6" fontWeight={700}>
            Overview
          </Typography>
          <Button 
            size="small" 
            endIcon={<ChevronRightIcon fontSize="small" />} 
            onClick={() => navigate("/notes")}
            sx={{ fontWeight: 600, color: "primary.main" }}
          >
            View all
          </Button>
        </Stack>

        {isMobile ? (
          /* Mobile Horizontal Scroll Carousel */
          <Box 
            sx={{ 
              display: "flex", 
              gap: 2, 
              overflowX: "auto", 
              mt: 1.5,
              pb: 1,
              pt: 0.5,
              px: 0.5,
              mx: -0.5,
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" }
            }}
          >
            <Box sx={{ minWidth: 180, flex: "0 0 auto" }}>
              {renderOverviewCard("Total Notes", notes.length, <NotesIcon fontSize="small" />, <BlueSparkline />, "primary.container", "primary.main")}
            </Box>
            <Box sx={{ minWidth: 180, flex: "0 0 auto" }}>
              {renderOverviewCard("Pinned Notes", pinnedCount, <PinnedIcon fontSize="small" />, <PurpleSparkline />, "rgba(124, 58, 237, 0.1)", "#7C3AED")}
            </Box>
            <Box sx={{ minWidth: 180, flex: "0 0 auto" }}>
              {renderOverviewCard("Favorites", favoriteCount, <FavoriteIcon fontSize="small" />, <RedSparkline />, "rgba(220, 38, 38, 0.1)", "#DC2626")}
            </Box>
            <Box sx={{ minWidth: 180, flex: "0 0 auto" }}>
              {renderOverviewCard("Total Views", totalViews, <ViewIcon fontSize="small" />, <TealSparkline />, "rgba(13, 148, 136, 0.1)", "#0D9488")}
            </Box>
          </Box>
        ) : (
          /* Desktop Responsive 4-Column Grid */
          <Grid container spacing={3} sx={{ width: "100%", mt: 0.5 }}>
            <Grid item xs={12} sm={6} md={3}>
              {renderOverviewCard("Total Notes", notes.length, <NotesIcon fontSize="small" />, <BlueSparkline />, "primary.container", "primary.main")}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {renderOverviewCard("Pinned Notes", pinnedCount, <PinnedIcon fontSize="small" />, <PurpleSparkline />, "rgba(124, 58, 237, 0.1)", "#7C3AED")}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {renderOverviewCard("Favorites", favoriteCount, <FavoriteIcon fontSize="small" />, <RedSparkline />, "rgba(220, 38, 38, 0.1)", "#DC2626")}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {renderOverviewCard("Total Views", totalViews, <ViewIcon fontSize="small" />, <TealSparkline />, "rgba(13, 148, 136, 0.1)", "#0D9488")}
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Recent Notes Section Header & Controls */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Recent Notes
        </Typography>
        <Button 
          size="small" 
          endIcon={<ChevronRightIcon fontSize="small" />} 
          onClick={() => navigate("/notes")}
          sx={{ fontWeight: 600, color: "primary.main" }}
        >
          View all
        </Button>
      </Stack>

      {/* Filter Chips & View Controls */}
      <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Stack direction="row" spacing={1}>
          <Chip
            label="All Notes"
            clickable
            color={filterType === "all" ? "primary" : "default"}
            onClick={() => setFilterType("all")}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          />
          <Chip
            label="Pinned"
            clickable
            color={filterType === "pinned" ? "primary" : "default"}
            onClick={() => setFilterType("pinned")}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          />
          <Chip
            label="Favorites"
            clickable
            color={filterType === "favorites" ? "primary" : "default"}
            onClick={() => setFilterType("favorites")}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          />
        </Stack>

        {!isMobile && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              size="small"
              placeholder="Filter notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 220 }}
            />

            <Tooltip title="Grid View">
              <IconButton color={viewMode === "grid" ? "primary" : "default"} onClick={() => setViewMode("grid")}>
                <GridViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="List View">
              <IconButton color={viewMode === "list" ? "primary" : "default"} onClick={() => setViewMode("list")}>
                <ListViewIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Box>

      {/* Notes Display */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      ) : filteredNotes.length === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 4, p: 5, textAlign: "center", bgcolor: "background.paper" }}>
          <NotesIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="subtitle1" fontWeight={700}>
            No notes found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchQuery ? "No notes matching your search criteria." : "Create your first rich HTML note to get started!"}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/note/new")} sx={{ borderRadius: 3 }}>
            Create Note
          </Button>
        </Card>
      ) : isMobile ? (
        /* Mobile Compact Single-Column Note List */
        <Stack spacing={1.5}>
          {filteredNotes.map((note) => {
            const meta = extractNoteMetadata(note.content || "");
            const excerpt = meta.excerpt || stripHtmlTags(note.content || "").slice(0, 75);
            const dateStr = note.updatedAt?.toDate 
              ? format(note.updatedAt.toDate(), "MMM d, yyyy · h:mm a")
              : "Just now";

            return (
              <Paper
                key={note.id}
                variant="outlined"
                onClick={() => navigate(`/note/${note.id}`)}
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:active": { bgcolor: "action.hover" }
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={1.75} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                    <Box 
                      sx={{ 
                        p: 1.25, 
                        borderRadius: 3, 
                        bgcolor: "primary.container", 
                        color: "primary.main",
                        display: "flex",
                        flexShrink: 0
                      }}
                    >
                      <DocIcon fontSize="small" />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700} noWrap>
                        {note.title || "Untitled Note"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ mt: 0.25 }}>
                        {excerpt || "No additional text content"}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem", mt: 0.5, display: "block" }}>
                        {dateStr}
                      </Typography>
                    </Box>
                  </Stack>

                  <IconButton 
                    size="small" 
                    onClick={(e) => handleMenuOpen(e, note.id)} 
                    sx={{ color: "text.secondary", flexShrink: 0 }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      ) : (
        /* Desktop Grid / List View */
        <NoteCardGrid
          notes={filteredNotes}
          viewMode={viewMode}
          onCardClick={(note) => navigate(`/note/${note.id}`)}
          onDeleteNote={handleDeleteNote}
          onTogglePin={handleTogglePin}
          onToggleFavorite={handleToggleFavorite}
          onCreateClick={() => navigate("/note/new")}
        />
      )}

      {/* Overflow Menu for Mobile Note Items */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); if (selectedNoteId) navigate(`/note/${selectedNoteId}`); }}>
          <ListItemIcon><DocIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Read Note" />
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); if (selectedNoteId) navigate(`/note/${selectedNoteId}/edit`); }}>
          <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Edit Note" />
        </MenuItem>
        <MenuItem 
          onClick={() => { 
            handleMenuClose(); 
            if (selectedNoteId) {
              navigator.clipboard.writeText(`${window.location.origin}/note/${selectedNoteId}`);
              toast.success("Link copied!");
            }
          }}
        >
          <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Share Link" />
        </MenuItem>
        <MenuItem 
          onClick={() => { 
            handleMenuClose(); 
            if (selectedNoteId) handleDeleteNote(selectedNoteId);
          }} 
          sx={{ color: "error.main" }}
        >
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>

      {/* Migration Progress Dialog */}
      <Dialog open={migrating}>
        <DialogTitle>Converting Markdown Notes to HTML</DialogTitle>
        <DialogContent sx={{ minWidth: 320, pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {migrationProgress.msg || "Processing Firestore notes..."}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={migrationProgress.total ? (migrationProgress.current / migrationProgress.total) * 100 : 0}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DashboardPage;
