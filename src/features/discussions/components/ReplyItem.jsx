import React, { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Button,
  Chip,
  Tooltip,
  Divider
} from "@mui/material";
import {
  ThumbUpOutlined as LikeIcon,
  ThumbUp as LikedIcon,
  Reply as ReplyIcon,
  CheckCircle as SolvedIcon,
  DeleteOutline as DeleteIcon,
  Star as BestAnswerIcon
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import ReplyComposer from "./ReplyComposer";

const ReplyItem = ({
  reply,
  topic,
  currentUserId,
  likedIds,
  onLike,
  onReplySubmit,
  onMarkSolved,
  onDelete,
  depth = 0
}) => {
  const [showReplyComposer, setShowReplyComposer] = useState(false);

  const isLiked = likedIds.has(reply.id);
  const isBestAnswer = topic.bestAnswerReplyId === reply.id;
  const isTopicAuthor = topic.authorId === reply.authorId;
  const isNoteAuthor = topic.noteAuthorId === reply.authorId;
  const canMarkSolved = (currentUserId === topic.noteAuthorId || currentUserId === topic.authorId) && !topic.isLocked;
  const canDelete = currentUserId === reply.authorId || currentUserId === topic.noteAuthorId;

  return (
    <Box
      sx={{
        pl: depth > 0 ? { xs: 2, sm: 4 } : 0,
        mt: 2,
        borderLeft: depth > 0 ? "2px solid" : "none",
        borderColor: isBestAnswer ? "success.main" : "divider"
      }}
    >
      <Box
        sx={{
          p: 2.5,
          borderRadius: 3,
          bgcolor: isBestAnswer 
            ? (theme) => theme.palette.mode === "dark" ? "rgba(46, 125, 50, 0.12)" : "rgba(232, 245, 233, 0.7)"
            : "background.paper",
          border: "1px solid",
          borderColor: isBestAnswer ? "success.light" : "divider"
        }}
      >
        {isBestAnswer && (
          <Chip
            icon={<BestAnswerIcon sx={{ color: "success.main !important" }} />}
            label="Verified Best Answer"
            color="success"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 700, mb: 1.5, borderRadius: 2 }}
          />
        )}

        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            src={reply.authorPhoto}
            sx={{ width: 36, height: 36, bgcolor: "primary.main", fontWeight: 700, fontSize: "0.9rem" }}
          >
            {reply.authorName?.charAt(0) || "U"}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography variant="subtitle2" fontWeight={700}>
                {reply.authorName || "Anonymous"}
              </Typography>

              {isNoteAuthor && (
                <Chip label="Author" size="small" color="primary" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }} />
              )}

              <Typography variant="caption" color="text.secondary">
                {reply.createdAt?.toDate ? formatDistanceToNow(reply.createdAt.toDate()) + " ago" : "Just now"}
              </Typography>
            </Stack>

            <Typography variant="body2" sx={{ mt: 1.5, whitespace: "pre-wrap", color: "text.primary", lineHeight: 1.6 }}>
              {reply.content}
            </Typography>

            {reply.codeSnippet && (
              <Box
                component="pre"
                sx={{
                  p: 2,
                  mt: 1.5,
                  borderRadius: 2,
                  bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.04)",
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  overflowX: "auto",
                  border: "1px solid",
                  borderColor: "divider"
                }}
              >
                <code>{reply.codeSnippet}</code>
              </Box>
            )}

            <Stack direction="row" spacing={1} alignItems="center" mt={2}>
              <Button
                size="small"
                startIcon={isLiked ? <LikedIcon color="primary" fontSize="small" /> : <LikeIcon fontSize="small" />}
                onClick={() => onLike(reply.id)}
                sx={{ borderRadius: 2, fontWeight: 700, color: isLiked ? "primary.main" : "text.secondary" }}
              >
                {reply.likes || 0}
              </Button>

              {depth < 5 && !topic.isLocked && (
                <Button
                  size="small"
                  startIcon={<ReplyIcon fontSize="small" />}
                  onClick={() => setShowReplyComposer(!showReplyComposer)}
                  sx={{ borderRadius: 2, fontWeight: 700, color: "text.secondary" }}
                >
                  Reply
                </Button>
              )}

              {canMarkSolved && (
                <Tooltip title={isBestAnswer ? "Unmark as Best Answer" : "Mark as Best Answer"}>
                  <Button
                    size="small"
                    color={isBestAnswer ? "success" : "default"}
                    startIcon={<SolvedIcon fontSize="small" />}
                    onClick={() => onMarkSolved(reply.id, !isBestAnswer)}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    {isBestAnswer ? "Solved" : "Accept Answer"}
                  </Button>
                </Tooltip>
              )}

              {canDelete && (
                <IconButton size="small" onClick={() => onDelete(reply.id)} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>

      {showReplyComposer && (
        <Box sx={{ mt: 2, ml: { xs: 2, sm: 4 } }}>
          <ReplyComposer
            parentReplyAuthor={reply.authorName}
            onCancelParent={() => setShowReplyComposer(false)}
            onSubmit={async (data) => {
              await onReplySubmit({ ...data, parentReplyId: reply.id });
              setShowReplyComposer(false);
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ReplyItem;
