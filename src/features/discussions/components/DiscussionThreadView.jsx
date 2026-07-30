import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Tooltip
} from "@mui/material";
import {
  Close as CloseIcon,
  ThumbUpOutlined as LikeIcon,
  ThumbUp as LikedIcon,
  PushPin as PinnedIcon,
  Lock as LockedIcon,
  LockOpen as UnlockIcon,
  CheckCircle as SolvedIcon,
  DeleteOutline as DeleteIcon
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import {
  subscribeReplies,
  createReply,
  toggleLikeTopic,
  toggleLikeReply,
  markTopicSolved,
  toggleLockTopic,
  togglePinTopic,
  deleteTopic,
  deleteReply
} from "../services/discussionService";
import ReplyItem from "./ReplyItem";
import ReplyComposer from "./ReplyComposer";
import toast from "react-hot-toast";

const DiscussionThreadView = ({
  open,
  onClose,
  topic,
  currentUser,
  userProfile,
  likedIds
}) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topic?.id) return;
    setLoading(true);
    const unsubscribe = subscribeReplies(topic.id, (fetchedReplies) => {
      setReplies(fetchedReplies);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [topic?.id]);

  if (!topic) return null;

  const currentUserId = currentUser?.uid;
  const isTopicLiked = likedIds.has(topic.id);
  const isNoteAuthor = currentUserId === topic.noteAuthorId;
  const isTopicAuthor = currentUserId === topic.authorId;
  const canModerate = isNoteAuthor || isTopicAuthor;

  const handleToggleLikeTopic = async () => {
    if (!currentUserId) {
      toast.error("Please login to upvote.");
      return;
    }
    try {
      await toggleLikeTopic(topic.id, currentUserId);
    } catch {
      toast.error("Failed to upvote topic.");
    }
  };

  const handlePostReply = async (replyData) => {
    if (!currentUserId) {
      toast.error("Please login to post a reply.");
      return;
    }
    if (topic.isLocked) {
      toast.error("This thread is locked by the author.");
      return;
    }
    await createReply(topic.id, replyData, userProfile, topic.noteAuthorId);
    toast.success("Reply posted!");
  };

  const handleMarkSolved = async (replyId, isSolved) => {
    try {
      await markTopicSolved(topic.id, replyId, isSolved);
      toast.success(isSolved ? "Marked as solved!" : "Unmarked solved status.");
    } catch {
      toast.error("Failed to update solved status.");
    }
  };

  const handleToggleLock = async () => {
    try {
      await toggleLockTopic(topic.id, !topic.isLocked);
      toast.success(!topic.isLocked ? "Thread locked." : "Thread unlocked.");
    } catch {
      toast.error("Failed to update thread lock.");
    }
  };

  const handleTogglePin = async () => {
    try {
      await togglePinTopic(topic.id, !topic.isPinned);
      toast.success(!topic.isPinned ? "Topic pinned." : "Topic unpinned.");
    } catch {
      toast.error("Failed to update pin.");
    }
  };

  const handleDeleteTopic = async () => {
    if (window.confirm("Are you sure you want to delete this discussion topic?")) {
      try {
        await deleteTopic(topic.id);
        toast.success("Topic deleted.");
        onClose();
      } catch {
        toast.error("Failed to delete topic.");
      }
    }
  };

  // Group replies into top-level and nested children
  const topLevelReplies = replies.filter((r) => !r.parentReplyId);
  const getChildReplies = (parentId) => replies.filter((r) => r.parentReplyId === parentId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 0, maxHeight: "90vh" }
      }}
    >
      <DialogTitle
        sx={{
          p: 2.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider"
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip label={topic.category || "General"} color="primary" variant="outlined" size="small" sx={{ fontWeight: 700 }} />
          {topic.isPinned && <Chip icon={<PinnedIcon />} label="Pinned" size="small" color="secondary" sx={{ fontWeight: 700 }} />}
          {topic.isSolved && <Chip icon={<SolvedIcon />} label="Solved" size="small" color="success" sx={{ fontWeight: 700 }} />}
          {topic.isLocked && <Chip icon={<LockedIcon />} label="Locked" size="small" color="warning" sx={{ fontWeight: 700 }} />}
        </Stack>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Main Topic Header & Content */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em" mb={2}>
            {topic.title}
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" mb={3}>
            <Avatar src={topic.authorPhoto} sx={{ width: 44, height: 44, bgcolor: "primary.main", fontWeight: 700 }}>
              {topic.authorName?.charAt(0) || "U"}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {topic.authorName || "Anonymous"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Posted {topic.createdAt?.toDate ? formatDistanceToNow(topic.createdAt.toDate()) + " ago" : "Recently"}
              </Typography>
            </Box>
          </Stack>

          <Typography variant="body1" sx={{ whitespace: "pre-wrap", lineHeight: 1.7, color: "text.primary", mb: 3 }}>
            {topic.content}
          </Typography>

          {topic.tags && topic.tags.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" mb={3}>
              {topic.tags.map((t) => (
                <Chip key={t} label={`#${t}`} size="small" variant="outlined" sx={{ borderRadius: 2 }} />
              ))}
            </Stack>
          )}

          {/* Topic Action Bar */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" pb={2} borderBottom="1px solid" borderColor="divider">
            <Button
              variant={isTopicLiked ? "contained" : "outlined"}
              startIcon={isTopicLiked ? <LikedIcon /> : <LikeIcon />}
              onClick={handleToggleLikeTopic}
              sx={{ borderRadius: 2.5, fontWeight: 700 }}
            >
              {topic.likeCount || 0} Upvotes
            </Button>

            {canModerate && (
              <Stack direction="row" spacing={1}>
                <Tooltip title={topic.isPinned ? "Unpin Topic" : "Pin Topic"}>
                  <IconButton onClick={handleTogglePin} color={topic.isPinned ? "secondary" : "default"}>
                    <PinnedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={topic.isLocked ? "Unlock Thread" : "Lock Thread"}>
                  <IconButton onClick={handleToggleLock} color={topic.isLocked ? "warning" : "default"}>
                    {topic.isLocked ? <LockedIcon /> : <UnlockIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Topic">
                  <IconButton onClick={handleDeleteTopic} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Stack>
        </Box>

        {/* Replies Section */}
        <Typography variant="h6" fontWeight={800} mb={2}>
          Replies ({replies.length})
        </Typography>

        {/* Sticky Reply Composer */}
        {!topic.isLocked && (
          <Box mb={4}>
            <ReplyComposer onSubmit={handlePostReply} placeholder="Join the discussion..." />
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : topLevelReplies.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
            <Typography variant="body2">No replies yet. Be the first to share your thoughts!</Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {topLevelReplies.map((reply) => (
              <React.Fragment key={reply.id}>
                <ReplyItem
                  reply={reply}
                  topic={topic}
                  currentUserId={currentUserId}
                  likedIds={likedIds}
                  onLike={(id) => toggleLikeReply(id, currentUserId)}
                  onReplySubmit={handlePostReply}
                  onMarkSolved={handleMarkSolved}
                  onDelete={(id) => deleteReply(id, topic.id)}
                  depth={0}
                />

                {/* Render Nested Replies */}
                {getChildReplies(reply.id).map((child) => (
                  <ReplyItem
                    key={child.id}
                    reply={child}
                    topic={topic}
                    currentUserId={currentUserId}
                    likedIds={likedIds}
                    onLike={(id) => toggleLikeReply(id, currentUserId)}
                    onReplySubmit={handlePostReply}
                    onMarkSolved={handleMarkSolved}
                    onDelete={(id) => deleteReply(id, topic.id)}
                    depth={1}
                  />
                ))}
              </React.Fragment>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DiscussionThreadView;
