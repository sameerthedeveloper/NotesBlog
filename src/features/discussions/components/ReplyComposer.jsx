import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  Typography,
  Chip
} from "@mui/material";
import {
  Send as SendIcon,
  Code as CodeIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  Close as CancelIcon
} from "@mui/icons-material";
import toast from "react-hot-toast";

const ReplyComposer = ({
  onSubmit,
  parentReplyAuthor = null,
  onCancelParent = null,
  placeholder = "Write a constructive reply..."
}) => {
  const [content, setContent] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleInsertFormatting = (prefix, suffix = "") => {
    setContent((prev) => `${prev}${prefix}text${suffix}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !codeSnippet.trim()) {
      toast.error("Please enter a reply before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        content: content.trim(),
        codeSnippet: codeSnippet.trim()
      });
      setContent("");
      setCodeSnippet("");
      setShowCode(false);
      if (onCancelParent) onCancelParent();
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      toast.error("Failed to post reply.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider"
      }}
    >
      {parentReplyAuthor && (
        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
          <Chip
            size="small"
            label={`Replying to @${parentReplyAuthor}`}
            onDelete={onCancelParent}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, borderRadius: 2 }}
          />
        </Stack>
      )}

      <Stack spacing={1.5}>
        <TextField
          multiline
          minRows={3}
          maxRows={8}
          fullWidth
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
              fontSize: "0.95rem"
            }
          }}
        />

        {showCode && (
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="// Paste code snippet or LaTeX here..."
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontFamily: "monospace",
                fontSize: "0.85rem",
                bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.03)"
              }
            }}
          />
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Bold (**text**)">
              <IconButton size="small" onClick={() => handleInsertFormatting("**", "**")}>
                <BoldIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Italic (*text*)">
              <IconButton size="small" onClick={() => handleInsertFormatting("*", "*")}>
                <ItalicIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Toggle Code Snippet">
              <IconButton
                size="small"
                color={showCode ? "primary" : "default"}
                onClick={() => setShowCode(!showCode)}
              >
                <CodeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            sx={{ borderRadius: 2.5, fontWeight: 700, px: 3 }}
          >
            {submitting ? "Posting..." : "Reply"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ReplyComposer;
