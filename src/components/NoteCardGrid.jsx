import React, { useRef, useEffect } from "react";
import { Grid, Box, Typography, Button, Skeleton } from "@mui/material";
import { Notes as NotesIcon, Add as AddIcon } from "@mui/icons-material";
import NoteCard from "./NoteCard";
import toast from "react-hot-toast";
import { staggerReveal } from "../utils/animationManager";

export const NoteCardGrid = ({
  notes = [],
  loading = false,
  viewMode = "grid", // 'grid' | 'list'
  searchQuery = "",
  onDeleteNote,
  onTogglePin,
  onToggleFavorite,
  onCardClick,
  onCreateClick,
  emptyMessage = "No notes found"
}) => {
  const gridRef = useRef(null);

  useEffect(() => {
    if (gridRef.current && notes.length > 0) {
      const cards = gridRef.current.querySelectorAll(".note-card-item");
      staggerReveal(cards, { stagger: 0.04, duration: 0.3 });
    }
  }, [notes, viewMode]);

  if (loading) {
    return (
      <Grid container spacing={3} sx={{ width: "100%", mt: 0.5 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i} sx={{ display: "flex" }}>
            <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 4, width: "100%" }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <Box 
        sx={{ 
          width: "100%", 
          borderRadius: 4, 
          p: 6, 
          textAlign: "center", 
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          my: 2
        }}
      >
        <NotesIcon sx={{ fontSize: 56, color: "text.disabled", mb: 1.5 }} />
        <Typography variant="h6" fontWeight={700}>
          {emptyMessage}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: "auto" }}>
          {searchQuery ? "No notes matching your search query. Try refining your filters." : "Create your first rich HTML note to get started!"}
        </Typography>
        {onCreateClick && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateClick} sx={{ borderRadius: 3, px: 3, fontWeight: 700 }}>
            Create Note
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Grid ref={gridRef} container spacing={3} sx={{ width: "100%", mt: 0.5, mb: 2 }}>
      {notes.map((note) => (
        <Grid
          className="note-card-item"
          size={{
            xs: 12,
            sm: viewMode === "grid" ? 6 : 12,
            md: viewMode === "grid" ? 4 : 12,
            lg: viewMode === "grid" ? 3 : 12,
          }}
          key={note.id}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <NoteCard
            note={note}
            onClick={() => onCardClick ? onCardClick(note) : null}
            onDelete={onDeleteNote ? () => onDeleteNote(note.id) : null}
            onTogglePin={onTogglePin ? () => onTogglePin(note.id, note.isPinned) : null}
            onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(note.id, note.isFavorite) : null}
            onShare={() => {
              const path = note.visibility === "public" ? `/public/note/${note.id}` : `/note/${note.id}`;
              navigator.clipboard.writeText(`${window.location.origin}${path}`);
              toast.success("Note link copied to clipboard!");
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default NoteCardGrid;
