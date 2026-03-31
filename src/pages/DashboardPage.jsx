import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Typography, 
  Box, 
  Container,
  Chip,
  Stack,
  Fade,
  useTheme,
  alpha,
  Button,
  useMediaQuery,
  Grid
} from "@mui/material";
import { 
  Add as AddIcon, 
  SearchOff as NoResultsIcon,
  NoteAdd as NoNotesIcon
} from "@mui/icons-material";
import NoteCard from "../components/NoteCard";
import NoteCardSkeleton from "../features/notes/components/NoteCardSkeleton";
import { useNotes } from "../features/notes/hooks/useNotes";
import { deleteNote, togglePin, toggleFavorite } from "../features/notes/services/notesService";
import { useDebounce } from "../utils/useDebounce";
import toast from "react-hot-toast";
import AdSense from "../components/AdSense";

const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get("filter");
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const { notes, loading } = useNotes();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Listen for search events from the Global Header 
  useEffect(() => {
    const handleGlobalSearch = (e) => {
        setSearchQuery(e.detail);
    };
    window.addEventListener('global-search', handleGlobalSearch);
    return () => window.removeEventListener('global-search', handleGlobalSearch);
  }, []);

  const filteredNotes = useMemo(() => {
    let result = notes;

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(note => 
        note.title?.toLowerCase().includes(query) || 
        note.content?.toLowerCase().includes(query) ||
        note.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedTag) {
      result = result.filter(note => note.tags?.includes(selectedTag));
    }

    if (filterParam === "favorite") {
      result = result.filter(note => note.isFavorite);
    } else if (filterParam === "pinned") {
      result = result.filter(note => note.isPinned);
    }

    return result;
  }, [notes, debouncedSearch, selectedTag, filterParam]);

  const allTags = useMemo(() => {
    const tags = new Set();
    notes.forEach(note => {
      note.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [notes]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteNote(id);
      toast.success("Note moved to trash");
    } catch (error) {
      toast.error("Failed to delete note");
    }
  }, []);

  const handleTogglePin = useCallback(async (id, currentStatus) => {
    try {
      await togglePin(id, !currentStatus);
      toast.success(!currentStatus ? "Pinned" : "Unpinned");
    } catch (error) {
      toast.error("Error updating pin");
    }
  }, []);

  const handleToggleFavorite = useCallback(async (id, currentStatus) => {
    try {
      await toggleFavorite(id, !currentStatus);
      toast.success(!currentStatus ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
       toast.error("Error updating favorites");
    }
  }, []);

  const EmptyState = ({ icon, title, subtitle, action }) => (
    <Fade in timeout={600}>
      <Box 
        sx={{ 
          textAlign: "center", 
          py: 16, 
          px: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Box sx={{ 
            color: "primary.main", 
            mb: 4, 
            opacity: 0.15 
        }}>
          {React.cloneElement(icon, { sx: { fontSize: 120 } })}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, letterSpacing: '-1px', color: 'text.primary' }}>{title}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, fontWeight: 500 }}>
          {subtitle}
        </Typography>
        {action}
      </Box>
    </Fade>
  );

  return (
    <Box>
      <Stack spacing={4}>
        <Box sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}`, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {filterParam === "favorite" ? "Favorites" : filterParam === "pinned" ? "Pinned" : "All Notes"}
            </Typography>
            {notes.length > 0 && (
                <Chip 
                    label={filteredNotes.length} 
                    size="small" 
                    sx={{ fontWeight: 800, background: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', height: 20 }} 
                />
            )}
        </Box>

        {allTags.length > 0 && !debouncedSearch && (
          <Stack direction="row" spacing={1} sx={{ overflowX: "auto", py: 0.5 }}>
            <Chip 
              label="All" 
              onClick={() => setSelectedTag(null)}
              variant={selectedTag === null ? "filled" : "outlined"}
              color={selectedTag === null ? "primary" : "default"}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            />
            {allTags.map(tag => (
              <Chip 
                key={tag}
                label={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                variant={selectedTag === tag ? "filled" : "outlined"}
                color={selectedTag === tag ? "primary" : "default"}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              />
            ))}
          </Stack>
        )}

        {(loading && notes.length === 0) ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <NoteCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : filteredNotes.length === 0 ? (
          <EmptyState 
            icon={debouncedSearch ? <NoResultsIcon /> : <NoNotesIcon />}
            title={debouncedSearch ? "No matching notes" : "No notes yet"}
            subtitle={debouncedSearch ? "Check your spelling or filter criteria." : "Create your first note to begin your journey."}
            action={!debouncedSearch && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => navigate("/note/new")}
                sx={{ borderRadius: 1, px: 4, py: 1.5, fontWeight: 700 }}
              >
                Create note
              </Button>
            )}
          />
        ) : (
          <Grid container spacing={3}>
            {filteredNotes.map((note, index) => (
              <React.Fragment key={note.id}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <NoteCard 
                    note={note} 
                    onClick={() => navigate(`/note/${note.id}/edit`)}
                    onDelete={() => handleDelete(note.id)}
                    onTogglePin={() => handleTogglePin(note.id, note.isPinned)}
                    onToggleFavorite={() => handleToggleFavorite(note.id, note.isFavorite)}
                    onShare={(e) => {
                      if(e) e.stopPropagation();
                      const publicUrl = `${window.location.origin}/note/${note.id}`;
                      navigator.clipboard.writeText(publicUrl);
                      toast.success("Link copied!");
                      if (note.visibility !== "public") {
                        toast("Heads up: Guests can't view private notes.", { icon: "🔒" });
                      }
                    }}
                  />
                </Grid>
                {/* Insert Native In-Feed AdBlock every 5 notes */}
                {(index + 1) % 5 === 0 && (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                     <Box sx={{ height: '100%', minHeight: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <AdSense adSlot="3200385772" />
                     </Box>
                  </Grid>
                )}
              </React.Fragment>
            ))}
          </Grid>
        )}
      </Stack>
    </Box>
  );
};

export default DashboardPage;
