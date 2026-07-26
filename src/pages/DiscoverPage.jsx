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
import { subscribePublicNotes, togglePin, toggleFavorite } from "../features/notes/services/notesService";
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
  
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribePublicNotes((fetchedNotes) => {
      setNotes(fetchedNotes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleTogglePin = async (id, currentStatus) => {
    try {
      await togglePin(id, !currentStatus);
      toast.success(!currentStatus ? "Pinned" : "Unpinned");
    } catch {
      toast.error("Error updating pin");
    }
  };

  const handleToggleFavorite = async (id, currentStatus) => {
    try {
      await toggleFavorite(id, !currentStatus);
      toast.success(!currentStatus ? "Added to favorites" : "Removed from favorites");
    } catch {
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
            <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
              <NoteCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : notes.length === 0 ? (
        <EmptyState />
      ) : (
        <Grid container spacing={3}>
          {notes.map((note) => (
            <Grid key={note.id} item xs={12} sm={6} md={4} lg={3}>
              <NoteCard 
                note={note} 
                onClick={() => navigate(`/note/${note.id}`)}
                onDelete={() => toast.error("You cannot delete public notes.")}
                onTogglePin={() => handleTogglePin(note.id, note.isPinned)}
                onToggleFavorite={() => handleToggleFavorite(note.id, note.isFavorite)}
                onShare={(e) => {
                  if(e) e.stopPropagation();
                  const publicUrl = `${window.location.origin}/note/${note.id}`;
                  navigator.clipboard.writeText(publicUrl);
                  toast.success("Link copied!");
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default DiscoverPage;
