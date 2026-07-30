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
import { 
  subscribeUserNotes, 
  subscribeUserBookmarks,
  deleteNote, 
  togglePin, 
  toggleFavorite 
} from "../features/notes/services/notesService";
import NoteCard from "../components/NoteCard";
import toast from "react-hot-toast";

export const BookmarksPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [ownNotes, setOwnNotes] = useState([]);
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    let loadedCount = 0;
    const checkDone = () => {
      loadedCount++;
      if (loadedCount >= 2) setLoading(false);
    };

    const unsubNotes = subscribeUserNotes(currentUser.uid, {}, (fetchedNotes) => {
      setOwnNotes(fetchedNotes);
      checkDone();
    });

    const unsubBookmarks = subscribeUserBookmarks(currentUser.uid, (fetchedBookmarks) => {
      setUserBookmarks(fetchedBookmarks);
      checkDone();
    });

    return () => {
      unsubNotes();
      unsubBookmarks();
    };
  }, [currentUser]);

  // Combine own notes that have isFavorite with bookmarked public notes
  const ownFavs = ownNotes.filter((n) => n.isFavorite);
  const ownFavIds = new Set(ownFavs.map((n) => n.id));

  const externalBookmarks = userBookmarks
    .filter((bm) => !ownFavIds.has(bm.id || bm.noteId))
    .map((bm) => ({
      id: bm.noteId || bm.id,
      title: bm.title || "Bookmarked Note",
      content: bm.content || "",
      authorId: bm.authorId || "",
      authorName: bm.authorName || "Community Member",
      visibility: bm.visibility || "public",
      tags: bm.tags || [],
      isFavorite: true,
      isPinned: !!bm.isPinned,
      updatedAt: bm.updatedAt
    }));

  const allBookmarks = [...ownFavs, ...externalBookmarks];

  const handleDelete = async (note) => {
    if (note.authorId && note.authorId !== currentUser?.uid) {
      toast.error("You can only remove this note from your bookmarks.");
      await toggleFavorite(note.id, false, currentUser.uid, note);
      return;
    }
    await deleteNote(note.id);
    toast.success("Note deleted");
  };

  const handleToggleFavorite = async (note) => {
    try {
      await toggleFavorite(note.id, !note.isFavorite, currentUser.uid, note);
      toast.success(!note.isFavorite ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch {
      toast.error("Error updating bookmark");
    }
  };

  const handleTogglePin = async (note) => {
    try {
      await togglePin(note.id, !note.isPinned, currentUser.uid, note);
      toast.success(!note.isPinned ? "Pinned" : "Unpinned");
    } catch {
      toast.error("Error updating pin");
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
          Bookmarks & Favorites
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quickly access your starred notes and public notes saved from Discover.
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
      ) : allBookmarks.length === 0 ? (
        <Card variant="outlined" sx={{ p: 6, textAlign: "center", borderRadius: 4 }}>
          <BookmarkIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            No bookmarks yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Star your notes or save public notes from the Discover section to view them here.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {allBookmarks.map((note) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={note.id}>
              <NoteCard
                note={note}
                onClick={() => {
                  if (note.authorId && note.authorId !== currentUser?.uid) {
                    navigate(`/public/note/${note.id}`);
                  } else {
                    navigate(`/note/${note.id}`);
                  }
                }}
                onDelete={() => handleDelete(note)}
                onToggleFavorite={() => handleToggleFavorite(note)}
                onTogglePin={() => handleTogglePin(note)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default BookmarksPage;
