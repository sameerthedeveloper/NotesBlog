import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import {
  Forum as ForumIcon,
  Chat as ChatIcon,
  Groups as GroupsIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Comment as CommentIcon,
  ThumbUpOutlined as LikeIcon,
  PushPin as PinnedIcon,
  CheckCircle as SolvedIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Psychology as AIIcon
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext";
import {
  subscribeGlobalForums
} from "../features/community/services/communityService";
import {
  subscribeUserLikes,
  createTopic
} from "../features/discussions/services/discussionService";
import GroupChatView from "../features/community/components/GroupChatView";
import TopicComposerModal from "../features/discussions/components/TopicComposerModal";
import DiscussionThreadView from "../features/discussions/components/DiscussionThreadView";
import toast from "react-hot-toast";

const STUDY_GROUPS = [
  {
    title: "Computer Science & Software Engineering",
    description: "Collaborative study group for data structures, algorithms, system design, and web dev.",
    icon: <CodeIcon color="primary" sx={{ fontSize: 36 }} />,
    members: 1420,
    tag: "CS & Tech"
  },
  {
    title: "AI, Machine Learning & Data Science",
    description: "Explore neural networks, LLM prompting, Python notes, and predictive modeling.",
    icon: <AIIcon color="secondary" sx={{ fontSize: 36 }} />,
    members: 980,
    tag: "AI & ML"
  },
  {
    title: "Mathematics, Physics & Sciences",
    description: "Calculus, linear algebra, physics formulas, and latex note sharing.",
    icon: <SchoolIcon color="success" sx={{ fontSize: 36 }} />,
    members: 760,
    tag: "STEM"
  }
];

export const CommunityPage = () => {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  // Global Forums State
  const [topics, setTopics] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [loadingForums, setLoadingForums] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Subscribe to global forums
  useEffect(() => {
    setLoadingForums(true);
    const unsubForums = subscribeGlobalForums(categoryFilter, (fetchedTopics) => {
      setTopics(fetchedTopics);
      setLoadingForums(false);
    });

    let unsubLikes = () => {};
    if (currentUser?.uid) {
      unsubLikes = subscribeUserLikes(currentUser.uid, (ids) => setLikedIds(ids));
    } else {
      setLikedIds(new Set());
    }

    return () => {
      unsubForums();
      unsubLikes();
    };
  }, [categoryFilter, currentUser?.uid]);

  const handleCreateTopic = async (topicData) => {
    if (!currentUser) {
      toast.error("Please login to start a community topic.");
      return;
    }
    await createTopic("global_community", topicData, userProfile, "");
    toast.success("Community discussion topic posted!");
  };

  const filteredTopics = topics.filter((t) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(query) ||
      t.content.toLowerCase().includes(query) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(query)))
    );
  });

  return (
    <Box sx={{ width: "100%" }}>
      {/* Community Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={1}>
          <ForumIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            Community Hub
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Connect with learners worldwide through global forums, live group chat, and study communities.
        </Typography>
      </Box>

      {/* Main Navigation Tabs */}
      <Paper variant="outlined" sx={{ borderRadius: 3, mb: 4, px: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 800,
              fontSize: "1rem",
              py: 2,
              px: 3
            }
          }}
        >
          <Tab icon={<ForumIcon />} iconPosition="start" label="Global Forums" />
          <Tab icon={<ChatIcon />} iconPosition="start" label="Open Group Chat" />
          <Tab icon={<GroupsIcon />} iconPosition="start" label="Study Communities" />
        </Tabs>
      </Paper>

      {/* Tab 1: Global Discussion Forums */}
      {activeTab === 0 && (
        <Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            mb={3}
          >
            <TextField
              size="small"
              placeholder="Search global topics, questions, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                )
              }}
              sx={{ width: { xs: "100%", sm: "360px" }, "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                if (!currentUser) {
                  toast.error("Please login to post a topic.");
                  return;
                }
                setIsComposerOpen(true);
              }}
              sx={{ borderRadius: 3, fontWeight: 700, px: 3, py: 1.2 }}
            >
              Start New Topic
            </Button>
          </Stack>

          {/* Category Filter Chips */}
          <Stack direction="row" spacing={1} overflow="auto" pb={2} mb={3}>
            {["all", "Question & Answer", "General", "Code & Technical", "Study Group & Notes", "Feedback & Suggestions"].map((cat) => (
              <Chip
                key={cat}
                label={cat === "all" ? "All Categories" : cat}
                onClick={() => setCategoryFilter(cat)}
                color={categoryFilter === cat ? "primary" : "default"}
                variant={categoryFilter === cat ? "filled" : "outlined"}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              />
            ))}
          </Stack>

          {loadingForums ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={36} />
            </Box>
          ) : filteredTopics.length === 0 ? (
            <Card variant="outlined" sx={{ p: 6, textAlign: "center", borderRadius: 4 }}>
              <ForumIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" fontWeight={700}>
                No community topics yet
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Be the first to start a conversation in the global community!
              </Typography>
              <Button variant="outlined" onClick={() => setIsComposerOpen(true)} sx={{ borderRadius: 2.5, fontWeight: 700 }}>
                Post First Topic
              </Button>
            </Card>
          ) : (
            <Grid container spacing={2.5}>
              {filteredTopics.map((topic) => (
                <Grid key={topic.id} size={{ xs: 12 }}>
                  <Card
                    variant="outlined"
                    onClick={() => setSelectedTopic(topic)}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderLeft: topic.isPinned ? "4px solid" : topic.isSolved ? "4px solid" : "1px solid",
                      borderColor: topic.isPinned ? "secondary.main" : topic.isSolved ? "success.main" : "divider",
                      "&:hover": {
                        boxShadow: (theme) => theme.shadows[3],
                        borderColor: "primary.main"
                      }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar src={topic.authorPhoto} sx={{ width: 44, height: 44, bgcolor: "primary.main", fontWeight: 700 }}>
                        {topic.authorName?.charAt(0) || "U"}
                      </Avatar>

                      <Box sx={{ flexGrow: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" mb={0.5}>
                          <Chip label={topic.category || "General"} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                          {topic.isPinned && <Chip icon={<PinnedIcon />} label="Pinned" size="small" color="secondary" sx={{ fontWeight: 700 }} />}
                          {topic.isSolved && <Chip icon={<SolvedIcon />} label="Solved" size="small" color="success" sx={{ fontWeight: 700 }} />}
                        </Stack>

                        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                          {topic.title}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {topic.content}
                        </Typography>

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            By <strong>{topic.authorName || "Anonymous"}</strong> • {topic.createdAt?.toDate ? formatDistanceToNow(topic.createdAt.toDate()) + " ago" : "Recently"}
                          </Typography>

                          <Stack direction="row" spacing={2} alignItems="center">
                            <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                              <LikeIcon sx={{ fontSize: 16 }} />
                              <Typography variant="caption" fontWeight={700}>{topic.likeCount || 0}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                              <CommentIcon sx={{ fontSize: 16 }} />
                              <Typography variant="caption" fontWeight={700}>{topic.replyCount || 0} replies</Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* New Topic Modal */}
          <TopicComposerModal
            open={isComposerOpen}
            onClose={() => setIsComposerOpen(false)}
            onSubmit={handleCreateTopic}
          />

          {/* Topic Detail View */}
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
        </Box>
      )}

      {/* Tab 2: Open Group Chat */}
      {activeTab === 1 && (
        <GroupChatView currentUser={currentUser} userProfile={userProfile} />
      )}

      {/* Tab 3: Study Communities */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          {STUDY_GROUPS.map((group) => (
            <Grid key={group.title} size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ p: 3, borderRadius: 4, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    {group.icon}
                    <Chip label={group.tag} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                  </Stack>

                  <Typography variant="h6" fontWeight={800} mb={1}>
                    {group.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mb={3}>
                    {group.description}
                  </Typography>
                </Box>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    {group.members} active learners
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setActiveTab(1)}
                    sx={{ borderRadius: 2.5, fontWeight: 700 }}
                  >
                    Join Chat
                  </Button>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CommunityPage;
