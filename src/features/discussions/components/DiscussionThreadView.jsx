"use client";

import { useState, useEffect } from "react";
import {
  ThumbsUp,
  Pin,
  Lock,
  Unlock,
  CheckCircle2,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  deleteReply,
} from "../services/discussionService";
import ReplyItem from "./ReplyItem";
import ReplyComposer from "./ReplyComposer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DiscussionThreadView = ({ open, onClose, topic, currentUser, userProfile, likedIds }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (!topic?.id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting load state before a real-time Firestore subscription
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
    try {
      await deleteTopic(topic.id);
      toast.success("Topic deleted.");
      onClose();
    } catch {
      toast.error("Failed to delete topic.");
    }
  };

  const topLevelReplies = replies.filter((r) => !r.parentReplyId);
  const getChildReplies = (parentId) => replies.filter((r) => r.parentReplyId === parentId);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="font-semibold text-primary">
              {topic.category || "General"}
            </Badge>
            {topic.isPinned && (
              <Badge variant="secondary" className="gap-1"><Pin className="size-3" />Pinned</Badge>
            )}
            {topic.isSolved && (
              <Badge className="gap-1 bg-success text-success-foreground"><CheckCircle2 className="size-3" />Solved</Badge>
            )}
            {topic.isLocked && (
              <Badge variant="secondary" className="gap-1"><Lock className="size-3" />Locked</Badge>
            )}
          </div>
          <DialogTitle className="text-xl">{topic.title}</DialogTitle>
        </DialogHeader>

        <div className="mb-2 flex items-center gap-3">
          <Avatar className="size-11">
            <AvatarImage src={topic.authorPhoto || undefined} />
            <AvatarFallback>{topic.authorName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-bold">{topic.authorName || "Anonymous"}</p>
            <p className="text-xs text-muted-foreground">
              Posted {topic.createdAt?.toDate ? formatDistanceToNow(topic.createdAt.toDate()) + " ago" : "Recently"}
            </p>
          </div>
        </div>

        <p className="mb-3 leading-relaxed whitespace-pre-wrap">{topic.content}</p>

        {topic.tags?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {topic.tags.map((t) => (
              <Badge key={t} variant="outline" className="rounded-md">#{t}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-b border-border pb-4">
          <Button
            variant={isTopicLiked ? "default" : "outline"}
            onClick={handleToggleLikeTopic}
          >
            <ThumbsUp className={cn("size-4", isTopicLiked && "fill-current")} />
            {topic.likeCount || 0} Upvotes
          </Button>

          {canModerate && (
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className={topic.isPinned ? "text-primary" : "text-muted-foreground"}
                title={topic.isPinned ? "Unpin Topic" : "Pin Topic"}
                onClick={handleTogglePin}
              >
                <Pin className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className={topic.isLocked ? "text-amber-600" : "text-muted-foreground"}
                title={topic.isLocked ? "Unlock Thread" : "Lock Thread"}
                onClick={handleToggleLock}
              >
                {topic.isLocked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                title="Delete Topic"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        </div>

        <h3 className="mt-4 mb-3 text-lg font-extrabold">Replies ({replies.length})</h3>

        {!topic.isLocked && (
          <div className="mb-4">
            <ReplyComposer onSubmit={handlePostReply} placeholder="Join the discussion..." />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : topLevelReplies.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No replies yet. Be the first to share your thoughts!
          </p>
        ) : (
          topLevelReplies.map((reply) => (
            <div key={reply.id}>
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
            </div>
          ))
        )}
      </DialogContent>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this discussion topic?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the topic and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTopic}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default DiscussionThreadView;
