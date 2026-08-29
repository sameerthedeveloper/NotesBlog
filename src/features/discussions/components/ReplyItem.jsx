"use client";

import { useState } from "react";
import { ThumbsUp, Reply as ReplyIcon, CheckCircle2, Trash2, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
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
  depth = 0,
}) => {
  const [showReplyComposer, setShowReplyComposer] = useState(false);

  const isLiked = likedIds.has(reply.id);
  const isBestAnswer = topic.bestAnswerReplyId === reply.id;
  const isNoteAuthor = topic.noteAuthorId === reply.authorId;
  const canMarkSolved = (currentUserId === topic.noteAuthorId || currentUserId === topic.authorId) && !topic.isLocked;
  const canDelete = currentUserId === reply.authorId || currentUserId === topic.noteAuthorId;

  return (
    <div
      className={cn(
        "mt-4",
        depth > 0 && "border-l-2 border-border pl-4 sm:pl-8",
        isBestAnswer && depth > 0 && "border-emerald-500"
      )}
    >
      <div
        className={cn(
          "rounded-2xl border p-4",
          isBestAnswer ? "border-success/40 bg-success/8" : "border-border bg-card"
        )}
      >
        {isBestAnswer && (
          <Badge variant="outline" className="mb-3 gap-1.5 border-emerald-500/40 font-semibold text-emerald-600">
            <Star className="size-3.5" />
            Verified Best Answer
          </Badge>
        )}

        <div className="flex items-start gap-3">
          <Avatar className="size-9">
            <AvatarImage src={reply.authorPhoto || undefined} />
            <AvatarFallback>{reply.authorName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-bold">{reply.authorName || "Anonymous"}</span>
              {isNoteAuthor && (
                <Badge className="h-5 text-[10px] font-bold">Author</Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {reply.createdAt?.toDate ? formatDistanceToNow(reply.createdAt.toDate()) + " ago" : "Just now"}
              </span>
            </div>

            <p className="mt-1.5 leading-relaxed whitespace-pre-wrap">{reply.content}</p>

            {reply.codeSnippet && (
              <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-muted p-3 font-mono text-sm">
                <code>{reply.codeSnippet}</code>
              </pre>
            )}

            <div className="mt-2 flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className={cn("font-semibold", isLiked ? "text-primary" : "text-muted-foreground")}
                onClick={() => onLike(reply.id)}
              >
                <ThumbsUp className={cn("size-4", isLiked && "fill-current")} />
                {reply.likes || 0}
              </Button>

              {depth < 5 && !topic.isLocked && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="font-semibold text-muted-foreground"
                  onClick={() => setShowReplyComposer(!showReplyComposer)}
                >
                  <ReplyIcon className="size-4" />
                  Reply
                </Button>
              )}

              {canMarkSolved && (
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn("font-semibold", isBestAnswer && "text-emerald-600")}
                  title={isBestAnswer ? "Unmark as Best Answer" : "Mark as Best Answer"}
                  onClick={() => onMarkSolved(reply.id, !isBestAnswer)}
                >
                  <CheckCircle2 className="size-4" />
                  {isBestAnswer ? "Solved" : "Accept Answer"}
                </Button>
              )}

              {canDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-destructive"
                  onClick={() => onDelete(reply.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReplyComposer && (
        <div className="mt-2 ml-4 sm:ml-8">
          <ReplyComposer
            parentReplyAuthor={reply.authorName}
            onCancelParent={() => setShowReplyComposer(false)}
            onSubmit={async (data) => {
              await onReplySubmit({ ...data, parentReplyId: reply.id });
              setShowReplyComposer(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ReplyItem;
