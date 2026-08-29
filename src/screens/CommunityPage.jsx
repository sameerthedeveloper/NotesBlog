"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  MessageCircle,
  MessageCircle as ChatIcon,
  Users,
  Search,
  Plus,
  ThumbsUp,
  Pin,
  CheckCircle2,
  GraduationCap,
  Code2,
  BrainCircuit,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { subscribeGlobalForums } from "@/features/community/services/communityService";
import { subscribeUserLikes, createTopic } from "@/features/discussions/services/discussionService";
import GroupChatView from "@/features/community/components/GroupChatView";
import TopicComposerModal from "@/features/discussions/components/TopicComposerModal";
import DiscussionThreadView from "@/features/discussions/components/DiscussionThreadView";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STUDY_GROUPS = [
  {
    id: "computer-science",
    title: "Computer Science & Software Engineering",
    description: "Collaborative study group for data structures, algorithms, system design, and web dev.",
    icon: Code2,
    members: 1420,
    tag: "CS & Tech",
  },
  {
    id: "ai-learning",
    title: "AI, Machine Learning & Data Science",
    description: "Explore neural networks, LLM prompting, Python notes, and predictive modeling.",
    icon: BrainCircuit,
    members: 980,
    tag: "AI & ML",
  },
  {
    id: "study-lounge",
    title: "Mathematics, Physics & Sciences",
    description: "Calculus, linear algebra, physics formulas, and latex note sharing.",
    icon: GraduationCap,
    members: 760,
    tag: "STEM",
  },
];

const CATEGORIES = ["all", "Question & Answer", "General", "Code & Technical", "Study Group & Notes", "Feedback & Suggestions"];

export const CommunityPage = () => {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("forums");
  const [chatRoomId, setChatRoomId] = useState(null);

  const [topics, setTopics] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [loadingForums, setLoadingForums] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting load state before a real-time Firestore subscription
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
    <div className="w-full">
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2.5">
          <MessageSquare className="size-9 text-primary" />
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Community Hub</h1>
        </div>
        <p className="text-muted-foreground">
          Connect with learners worldwide through global forums, live group chat, and study communities.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="forums">
            <MessageSquare />
            Global Forums
          </TabsTrigger>
          <TabsTrigger value="chat">
            <ChatIcon />
            Open Group Chat
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Users />
            Study Communities
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "forums" && (
        <div>
          <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-90">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search global topics, questions, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Button
              onClick={() => {
                if (!currentUser) {
                  toast.error("Please login to post a topic.");
                  return;
                }
                setIsComposerOpen(true);
              }}
            >
              <Plus />
              Start New Topic
            </Button>
          </div>

          <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={categoryFilter === cat ? "default" : "outline"}
                className="shrink-0 rounded-full"
                onClick={() => setCategoryFilter(cat)}
              >
                {cat === "all" ? "All Categories" : cat}
              </Button>
            ))}
          </div>

          {loadingForums ? (
            <div className="flex justify-center py-14">
              <Loader2 className="size-9 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="rounded-2xl border border-border p-12 text-center">
              <MessageSquare className="mx-auto mb-3 size-12 text-muted-foreground/40" />
              <h3 className="text-lg font-bold">No community topics yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Be the first to start a conversation in the global community!
              </p>
              <Button variant="outline" onClick={() => setIsComposerOpen(true)}>
                Post First Topic
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={cn(
                    "rounded-2xl border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm",
                    topic.isPinned ? "border-l-4 border-l-primary" : topic.isSolved ? "border-l-4 border-l-emerald-500" : "border-border"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="size-11">
                      <AvatarImage src={topic.authorPhoto || undefined} />
                      <AvatarFallback>{topic.authorName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="font-semibold text-primary">
                          {topic.category || "General"}
                        </Badge>
                        {topic.isPinned && <Badge variant="secondary" className="gap-1"><Pin className="size-3" />Pinned</Badge>}
                        {topic.isSolved && <Badge className="gap-1 bg-success text-success-foreground"><CheckCircle2 className="size-3" />Solved</Badge>}
                      </div>

                      <h3 className="mb-1 font-bold">{topic.title}</h3>
                      <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{topic.content}</p>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          By <strong>{topic.authorName || "Anonymous"}</strong> ·{" "}
                          {topic.createdAt?.toDate ? formatDistanceToNow(topic.createdAt.toDate()) + " ago" : "Recently"}
                        </span>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span className="flex items-center gap-1 text-xs font-semibold">
                            <ThumbsUp className="size-3.5" />
                            {topic.likeCount || 0}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-semibold">
                            <MessageCircle className="size-3.5" />
                            {topic.replyCount || 0} replies
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <TopicComposerModal
            open={isComposerOpen}
            onClose={() => setIsComposerOpen(false)}
            onSubmit={handleCreateTopic}
          />

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
        </div>
      )}

      {activeTab === "chat" && (
        <GroupChatView currentUser={currentUser} userProfile={userProfile} initialRoomId={chatRoomId} />
      )}

      {activeTab === "groups" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STUDY_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.title} className="flex flex-col justify-between rounded-3xl border border-border p-5">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <Icon className="size-9 text-primary" />
                    <Badge variant="outline" className="font-semibold text-primary">{group.tag}</Badge>
                  </div>
                  <h3 className="mb-1.5 text-lg font-extrabold">{group.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{group.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {group.members} active learners
                  </span>
                  <Button
                    onClick={() => {
                      setChatRoomId(group.id);
                      setActiveTab("chat");
                    }}
                  >
                    Join Chat
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
