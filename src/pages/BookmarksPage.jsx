import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  Skeleton
} from "@mui/material";
import { Bookmark as BookmarkIcon } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { subscribeUserNotes, deleteNote, togglePin, toggleFavorite } from "../features/notes/services/notesService";
import NoteCard from "../components/NoteCard";
import toast from "react-hot-toast";

export const BookmarksPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeUserNotes(currentUser.uid, {}, (fetchedNotes) => {
      setNotes(fetchedNotes.filter((n) => n.isFavorite));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleDelete = async (id) => {
    await deleteNote(id);
    toast.success("Note deleted");
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
          Bookmarks & Favorites
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quickly access your starred and bookmarked rich text notes.
        </Typography>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : notes.length === 0 ? (
        <Card variant="outlined" sx={{ p: 6, textAlign: "center", borderRadius: 4 }}>
          <BookmarkIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            No bookmarks yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Star notes to save them in your bookmarks for quick reference.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {notes.map((note) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={note.id}>
              <NoteCard
                note={note}
                onClick={() => navigate(`/note/${note.id}/edit`)}
                onDelete={() => handleDelete(note.id)}
                onToggleFavorite={() => toggleFavorite(note.id, note.isFavorite)}
                onTogglePin={() => togglePin(note.id, note.isPinned)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default BookmarksPage;
