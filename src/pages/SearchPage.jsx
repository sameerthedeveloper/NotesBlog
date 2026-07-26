import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Skeleton,
  IconButton
} from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { subscribeUserNotes } from "../features/notes/services/notesService";
import { stripHtmlTags } from "../utils/sanitizer";
import NoteCard from "../components/NoteCard";

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeUserNotes(currentUser.uid, {}, (fetchedNotes) => {
      setNotes(fetchedNotes);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSearchParams(val ? { q: val } : {});
  };

  // Perform HTML-aware text searching
  const results = notes.filter((note) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    
    const titleMatch = note.title?.toLowerCase().includes(q);
    const tagMatch = note.tags?.some((t) => t.toLowerCase().includes(q));
    
    // Strip HTML tags for clean text matching
    const plainText = stripHtmlTags(note.content).toLowerCase();
    const contentMatch = plainText.includes(q);

    return titleMatch || tagMatch || contentMatch;
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em" mb={1}>
        HTML Content Search
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Search inside document titles, tags, and raw rich text content.
      </Typography>

      <TextField
        fullWidth
        placeholder="Type to search HTML notes..."
        value={query}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="primary" />
            </InputAdornment>
          ),
          endAdornment: query ? (
            <InputAdornment position="end">
              <IconButton onClick={() => handleSearchChange({ target: { value: "" } })}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ) : null,
          sx: { borderRadius: 3, fontSize: "1.1rem" }
        }}
        sx={{ mb: 4 }}
      />

      <Typography variant="subtitle1" fontWeight={700} mb={3}>
        Found {results.length} result{results.length === 1 ? "" : "s"}
      </Typography>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : results.length === 0 ? (
        <Card variant="outlined" sx={{ p: 6, textAlign: "center", borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={700}>
            No matching notes found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try a different search term or check spelling.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {results.map((note) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={note.id}>
              <NoteCard note={note} onClick={() => navigate(`/note/${note.id}/edit`)} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SearchPage;
