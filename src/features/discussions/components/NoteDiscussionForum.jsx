import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  Avatar,
  Tab,
  Tabs,
  CircularProgress
} from "@mui/material";
import {
  Forum as ForumIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Comment as CommentIcon,
  ThumbUpOutlined as LikeIcon,
  PushPin as PinnedIcon,
  CheckCircle as SolvedIcon,
  QuestionAnswer as QAIcon,
  FilterList as FilterIcon
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../../../context/AuthContext";
import {
  subscribeTopics,
  subscribeUserLikes,
  createTopic
} from "../services/discussionService";
import TopicComposerModal from "./TopicComposerModal";
import DiscussionThreadView from "./DiscussionThreadView";
import toast from "react-hot-toast";

export const NoteDiscussionForum = ({ noteId, noteAuthorId }) => {
  const { currentUser, userProfile } = useAuth();

  const [topics, setTopics] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [tabFilter, setTabFilter] = useState("all");

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    if (!noteId) return;

    setLoading(true);
    const unsubTopics = subscribeTopics(noteId, (fetchedTopics) => {
      setTopics(fetchedTopics);
      setLoading(false);
    });

    let unsubLikes = () => {};
    if (currentUser?.uid) {
      unsubLikes = subscribeUserLikes(currentUser.uid, (setIds) => setLikedIds(setIds));
    } else {
      setLikedIds(new Set());
    }

    return () => {
      unsubTopics();
      unsubLikes();
    };
  }, [noteId, currentUser?.uid]);

  const handleCreateTopic = async (topicData) => {
    if (!currentUser) {
      toast.error("Please login to start a discussion.");
      return;
    }
    await createTopic(noteId, topicData, userProfile, noteAuthorId);
    toast.success("Discussion topic posted!");
  };

  // Filter & Search Logic
  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    if (!matchesSearch) return false;

    if (tabFilter === "solved") return t.isSolved;
    if (tabFilter === "unsolved") return !t.isSolved;
    if (tabFilter === "pinned") return t.isPinned;
    return true;
  });

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2.5, sm: 4 },
        borderRadius: 4,
        mt: 6,
        bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"
      }}
    >
      {/* Forum Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
            <ForumIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">
              Discussion Forum
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Ask questions, share insights, collaborate, and learn together.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            if (!currentUser) {
              toast.error("Please login to start a discussion.");
              return;
            }
            setIsComposerOpen(true);
          }}
          sx={{ borderRadius: 3, fontWeight: 700, px: 3, py: 1.2 }}
        >
          New Topic
        </Button>
      </Stack>

      {/* Search & Filter Bar */}
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search discussion topics, questions, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Tabs
            value={tabFilter}
            onChange={(e, val) => setTabFilter(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 36,
              "& .MuiTab-root": { minHeight: 36, textTransform: "none", fontWeight: 700, borderRadius: 2 }
            }}
          >
            <Tab label={`All (${topics.length})`} value="all" />
            <Tab label="Solved" value="solved" />
            <Tab label="Unsolved" value="unsolved" />
            <Tab label="Pinned" value="pinned" />
          </Tabs>
        </Grid>
      </Grid>

      {/* Topics List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={36} />
        </Box>
      ) : filteredTopics.length === 0 ? (
        <Card variant="outlined" sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
          <QAIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            No discussions found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Be the first to start a conversation or ask a question about this note!
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setIsComposerOpen(true)}
            sx={{ borderRadius: 2.5, fontWeight: 700 }}
          >
            Start First Topic
          </Button>
        </Card>
      ) : (
        <Stack spacing={2}>
          {filteredTopics.map((topic) => (
            <Card
              key={topic.id}
              variant="outlined"
              onClick={() => setSelectedTopic(topic)}
              sx={{
                p: 2.5,
                borderRadius: 3,
                cursor: "pointer",
                transition: "all 0.2s ease",
                borderLeft: topic.isPinned ? "4px solid" : topic.isSolved ? "4px solid" : "1px solid",
                borderColor: topic.isPinned
                  ? "secondary.main"
                  : topic.isSolved
                  ? "success.main"
                  : "divider",
                "&:hover": {
                  boxShadow: (theme) => theme.shadows[3],
                  borderColor: "primary.main"
                }
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar
                  src={topic.authorPhoto}
                  sx={{ width: 42, height: 42, bgcolor: "primary.main", fontWeight: 700 }}
                >
                  {topic.authorName?.charAt(0) || "U"}
                </Avatar>

                <Box sx={{ flexGrow: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" mb={0.5}>
                    <Chip
                      label={topic.category || "General"}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 700, borderRadius: 1.5, height: 22 }}
                    />
                    {topic.isPinned && (
                      <Chip icon={<PinnedIcon />} label="Pinned" size="small" color="secondary" sx={{ fontWeight: 700, height: 22 }} />
                    )}
                    {topic.isSolved && (
                      <Chip icon={<SolvedIcon />} label="Solved" size="small" color="success" sx={{ fontWeight: 700, height: 22 }} />
                    )}
                  </Stack>

                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.1rem", mb: 0.5 }}>
                    {topic.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 1.5
                    }}
                  >
                    {topic.content}
                  </Typography>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      By <strong>{topic.authorName || "Anonymous"}</strong> •{" "}
                      {topic.createdAt?.toDate
                        ? formatDistanceToNow(topic.createdAt.toDate()) + " ago"
                        : "Recently"}
                    </Typography>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                        <LikeIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" fontWeight={700}>
                          {topic.likeCount || 0}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                        <CommentIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" fontWeight={700}>
                          {topic.replyCount || 0} replies
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {/* New Topic Modal */}
      <TopicComposerModal
        open={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSubmit={handleCreateTopic}
      />

      {/* Discussion Thread View Modal */}
      {selectedTopic && (
        <DiscussionThreadView
          open={Boolean(selectedTopic)}
          onClose={() => setSelectedTopic(null)}
          topic={selectedTopic}
          currentUser={currentUser}
          userProfile={userProfile}
          likedIds={likedIds}
        />
      )}
    </Paper>
  );
};

export default NoteDiscussionForum;
