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
  MenuItem,
  Pagination
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  GridView as GridViewIcon,
  FormatListBulleted as ListViewIcon,
  Sort as SortIcon
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { subscribeUserNotes, deleteNote, togglePin, toggleFavorite } from "../features/notes/services/notesService";
import NoteCard from "../components/NoteCard";
import NoteCardGrid from "../components/NoteCardGrid";
import toast from "react-hot-toast";

export const NotesPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeUserNotes(currentUser.uid, { sortField: sortBy }, (userNotes) => {
      setNotes(userNotes);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser, sortBy]);

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const handleTogglePin = async (noteId, isPinned) => {
    await togglePin(noteId, !isPinned);
  };

  const handleToggleFavorite = async (noteId, isFavorite) => {
    await toggleFavorite(noteId, !isFavorite);
  };

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q) ||
      n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const pageCount = Math.ceil(filteredNotes.length / itemsPerPage);
  const paginatedNotes = filteredNotes.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            My Notes Library
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Organize, search, and manage all your rich text HTML notes.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/note/new")}
          sx={{ borderRadius: 3, px: 3, fontWeight: 700 }}
        >
          New Note
        </Button>
      </Box>

      {/* Control Bar */}
      <Card variant="outlined" sx={{ mb: 4, borderRadius: 3, p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
          <TextField
            size="small"
            placeholder="Search title, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: "100%", sm: 300 } }}
          />

          <Stack direction="row" spacing={2} alignItems="center" sx={{ width: { xs: "100%", sm: "auto" } }}>
            <TextField
              select
              size="small"
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="updatedAt">Recently Updated</MenuItem>
              <MenuItem value="createdAt">Created Date</MenuItem>
              <MenuItem value="title">Title (A-Z)</MenuItem>
            </TextField>

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
        </Stack>
      </Card>

      {/* Notes Display */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : paginatedNotes.length === 0 ? (
        <Card variant="outlined" sx={{ p: 6, textAlign: "center", borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={700}>
            No notes found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Try adjusting your search criteria or create a new note.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/note/new")} sx={{ borderRadius: 3 }}>
            Create Note
          </Button>
        </Card>
      ) : (
        <>
          <NoteCardGrid
            notes={paginatedNotes}
            loading={loading}
            viewMode={viewMode}
            searchQuery={searchQuery}
            onCardClick={(note) => navigate(`/note/${note.id}`)}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePin}
            onToggleFavorite={handleToggleFavorite}
            onCreateClick={() => navigate("/note/new")}
          />

          {pageCount > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(e, val) => setPage(val)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default NotesPage;
