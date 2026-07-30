import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Stack,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress
} from "@mui/material";
import {
  AddComment as TopicIcon,
  Code as CodeIcon,
  LocalOffer as TagIcon
} from "@mui/icons-material";
import toast from "react-hot-toast";

const CATEGORIES = [
  "General",
  "Question & Answer",
  "Feedback & Suggestions",
  "Code & Technical",
  "Study Group & Notes",
  "Bug Report"
];

const TopicComposerModal = ({ open, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Question & Answer");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a discussion title.");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter discussion details.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        category,
        content: content.trim(),
        tags
      });
      setTitle("");
      setContent("");
      setTags([]);
      setTagInput("");
      onClose();
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      toast.error("Failed to create topic.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1.5 }}>
        <TopicIcon color="primary" />
        Start a New Discussion Topic
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ borderColor: "divider" }}>
          <Stack spacing={3}>
            <TextField
              autoFocus
              label="Topic Title"
              placeholder="What would you like to discuss or ask about this note?"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />

            <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Discussion Content (Markdown & Code Supported)"
              placeholder="Provide context, questions, code snippets, or ideas..."
              multiline
              rows={6}
              fullWidth
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontFamily: "monospace" } }}
            />

            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" mb={1} display="block">
                Tags (Up to 5 tags)
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <TextField
                  size="small"
                  placeholder="Add tag (e.g. math, code, quiz)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <Button variant="outlined" onClick={handleAddTag} sx={{ borderRadius: 2 }}>
                  Add Tag
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    size="small"
                    onDelete={() => handleRemoveTag(tag)}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} disabled={submitting} sx={{ borderRadius: 2, fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <TopicIcon />}
            sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
          >
            {submitting ? "Posting..." : "Post Topic"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default TopicComposerModal;
