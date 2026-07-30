import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Typography, 
  Box, 
  Fade,
  useTheme,
  Grid
} from "@mui/material";
import { 
  ExploreOff as NoNotesIcon
} from "@mui/icons-material";
import NoteCard from "../components/NoteCard";
import NoteCardSkeleton from "../features/notes/components/NoteCardSkeleton";
import { 
  subscribePublicNotes, 
  togglePin, 
  toggleFavorite,
  subscribeUserBookmarks,
  subscribeUserPins
} from "../features/notes/services/notesService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const EmptyState = () => (
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
        <NoNotesIcon sx={{ fontSize: 120 }} />
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, letterSpacing: '-1px', color: 'text.primary' }}>
        No public notes yet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, fontWeight: 500 }}>
        Check back later to discover new content shared by the community.
      </Typography>
    </Box>
  </Fade>
);

const DiscoverPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [notes, setNotes] = useState([]);
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [userPins, setUserPins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubPublic = subscribePublicNotes((fetchedNotes) => {
      setNotes(fetchedNotes);
      setLoading(false);
    });

    let unsubBookmarks = () => {};
    let unsubPins = () => {};

    if (currentUser?.uid) {
      unsubBookmarks = subscribeUserBookmarks(currentUser.uid, (bm) => setUserBookmarks(bm));
      unsubPins = subscribeUserPins(currentUser.uid, (pins) => setUserPins(pins));
    } else {
      setUserBookmarks([]);
      setUserPins([]);
    }

    return () => {
      unsubPublic();
      unsubBookmarks();
      unsubPins();
    };
  }, [currentUser]);

  const bookmarkedSet = new Set(userBookmarks.map((b) => b.id || b.noteId));
  const pinnedSet = new Set(userPins.map((p) => p.id || p.noteId));

  const handleTogglePin = async (note) => {
    if (!currentUser) {
      toast.error("Please login to pin notes.");
      return;
    }
    const currentlyPinned = pinnedSet.has(note.id) || (note.authorId === currentUser.uid && note.isPinned);
    try {
      await togglePin(note.id, !currentlyPinned, currentUser.uid, note);
      toast.success(!currentlyPinned ? "Pinned to your collection" : "Unpinned");
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      toast.error("Error updating pin");
    }
  };

  const handleToggleFavorite = async (note) => {
    if (!currentUser) {
      toast.error("Please login to bookmark notes.");
      return;
    }
    const currentlyFav = bookmarkedSet.has(note.id) || (note.authorId === currentUser.uid && note.isFavorite);
    try {
      await toggleFavorite(note.id, !currentlyFav, currentUser.uid, note);
      toast.success(!currentlyFav ? "Added to favorites & bookmarks" : "Removed from favorites");
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      toast.error("Error updating favorites");
    }
  };

  return (
    <Box>
      <Box sx={{ pb: 3, mb: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-1px' }}>
            Discover
          </Typography>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <NoteCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : notes.length === 0 ? (
        <EmptyState />
      ) : (
        <Grid container spacing={3}>
          {notes.map((note) => {
            const isNoteFav = bookmarkedSet.has(note.id) || (note.authorId === currentUser?.uid && note.isFavorite);
            const isNotePinned = pinnedSet.has(note.id) || (note.authorId === currentUser?.uid && note.isPinned);
            const displayNote = {
              ...note,
              isFavorite: isNoteFav,
              isPinned: isNotePinned
            };

            return (
              <Grid key={note.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <NoteCard 
                  note={displayNote} 
                  onClick={() => navigate(`/public/note/${note.id}`)}
                  onDelete={() => toast.error("You cannot delete public notes.")}
                  onTogglePin={() => handleTogglePin(note)}
                  onToggleFavorite={() => handleToggleFavorite(note)}
                  onShare={(e) => {
                    if (e) e.stopPropagation();
                    const publicUrl = `${window.location.origin}/public/note/${note.id}`;
                    navigator.clipboard.writeText(publicUrl);
                    toast.success("Link copied!");
                  }}
                />
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default DiscoverPage;
