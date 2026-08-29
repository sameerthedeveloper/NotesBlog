"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Plus, Search, ThumbsUp, MessageCircle, Pin, CheckCircle2, HelpCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { subscribeTopics, subscribeUserLikes, createTopic } from "../services/discussionService";
import TopicComposerModal from "./TopicComposerModal";
import DiscussionThreadView from "./DiscussionThreadView";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting load state before a real-time Firestore subscription
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
    <div className="mt-12 rounded-3xl border border-border bg-muted/30 p-5 sm:p-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <MessageSquare className="size-7 text-primary" />
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">Discussion Forum</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Ask questions, share insights, collaborate, and learn together.
          </p>
        </div>

        <Button
          onClick={() => {
            if (!currentUser) {
              toast.error("Please login to start a discussion.");
              return;
            }
            setIsComposerOpen(true);
          }}
        >
          <Plus />
          New Topic
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search discussion topics, questions, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={tabFilter} onValueChange={setTabFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({topics.length})</TabsTrigger>
            <TabsTrigger value="solved">Solved</TabsTrigger>
            <TabsTrigger value="unsolved">Unsolved</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <HelpCircle className="mx-auto mb-3 size-11 text-muted-foreground/40" />
          <h3 className="text-lg font-bold">No discussions found</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Be the first to start a conversation or ask a question about this note!
          </p>
          <Button variant="outline" onClick={() => setIsComposerOpen(true)}>
            Start First Topic
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
                <Avatar className="size-10.5">
                  <AvatarImage src={topic.authorPhoto || undefined} />
                  <AvatarFallback>{topic.authorName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="h-[22px] font-semibold text-primary">
                      {topic.category || "General"}
                    </Badge>
                    {topic.isPinned && (
                      <Badge variant="secondary" className="h-[22px] gap-1"><Pin className="size-3" />Pinned</Badge>
                    )}
                    {topic.isSolved && (
                      <Badge className="h-[22px] gap-1 bg-success text-success-foreground"><CheckCircle2 className="size-3" />Solved</Badge>
                    )}
                  </div>

                  <h3 className="mb-1 text-[1.05rem] font-bold">{topic.title}</h3>
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
  );
};

export default NoteDiscussionForum;
