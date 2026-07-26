import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Stack,
  TextField,
  InputAdornment
} from "@mui/material";
import { Search as SearchIcon, Share as ShareIcon } from "@mui/icons-material";
import { subscribePublicNotes } from "../features/notes/services/notesService";
import NoteCard from "../components/NoteCard";
import toast from "react-hot-toast";

export const SharedNotesPage = () => {
  const [publicNotes, setPublicNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribePublicNotes((notes) => {
      setPublicNotes(notes);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredNotes = publicNotes.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q) ||
      n.authorName?.toLowerCase().includes(q)
    );
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
          Shared & Public Notes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore notes published publicly by the OpenNotes community.
        </Typography>
      </Box>

      <TextField
        size="small"
        placeholder="Filter shared notes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 4, maxWidth: 400 }}
      />

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : filteredNotes.length === 0 ? (
        <Card variant="outlined" sx={{ p: 6, textAlign: "center", borderRadius: 4 }}>
          <ShareIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            No public notes found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Publish a note to web to see it showcased here!
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredNotes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <NoteCard
                note={note}
                onClick={() => navigate(`/note/${note.id}`)}
                onShare={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/note/${note.id}`);
                  toast.success("Public note link copied!");
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SharedNotesPage;
