"use client";

import {
  Pin,
  PinOff,
  Heart,
  Trash2,
  Share2,
  Eye,
  Lock,
  Globe,
  Zap,
  MoreHorizontal,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { stripHtmlTags } from "@/utils/sanitizer";
import { extractNoteMetadata } from "@/utils/metadataExtractor";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const NoteCard = ({ note, onDelete, onClick, onTogglePin, onToggleFavorite, onShare }) => {
  if (!note) return null;

  const { title = "Untitled Note", content = "", visibility = "private", updatedAt, tags = [], isPinned = false, isFavorite = false, viewCount = 0 } = note;

  const meta = extractNoteMetadata(content);
  const previewContent = (meta.excerpt || stripHtmlTags(content).slice(0, 140)) + (content?.length > 140 ? "..." : "");
  const hasOverflowActions = onToggleFavorite || onShare || onDelete;

  return (
    <Card
      className={cn(
        "group h-full w-full overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.75 hover:shadow-lg",
        isPinned ? "border-primary" : "border-border"
      )}
    >
      <button onClick={onClick} className="flex flex-1 flex-col items-stretch text-left ">
        <CardContent className="flex-1 p-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="line-clamp-2 text-[1.1rem] leading-snug font-bold text-foreground">
                {title || "Untitled Note"}
              </h3>
              <Badge
                variant={visibility === "public" ? "outline" : "secondary"}
                className="shrink-0 gap-1 rounded-md text-[10px] font-semibold"
              >
                {visibility === "public" ? <Globe className="size-3" /> : <Lock className="size-3" />}
                {visibility === "public" ? "Public" : "Private"}
              </Badge>
            </div>

            <p className="line-clamp-4 min-h-[3.8em] text-sm leading-relaxed text-muted-foreground">
              {previewContent || "No additional text content..."}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <Badge variant="secondary" className="gap-1 rounded-md bg-primary/8 text-xs font-semibold text-primary">
                <Zap className="size-3" />
                {meta.readingTimeMinutes} min read
              </Badge>
              {tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-md border-primary/20 bg-primary/4 text-xs font-semibold text-primary">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </button>

      <div className="flex items-center justify-between border-t border-border bg-muted/40 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold text-muted-foreground/70">
            {updatedAt?.toDate ? formatDistanceToNow(updatedAt.toDate()) + " ago" : "Recently"}
          </span>
          {viewCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 font-mono text-xs font-semibold text-muted-foreground/70">
                  <Eye className="size-3.5" />
                  {viewCount}
                </span>
              </TooltipTrigger>
              <TooltipContent>{viewCount} view{viewCount === 1 ? "" : "s"}</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 md:has-data-[state=open]:opacity-100">
          {onTogglePin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
                  aria-label={isPinned ? "Unpin" : "Pin"}
                  className={cn("rounded-lg p-1.5 hover:bg-muted", isPinned ? "text-primary" : "text-muted-foreground")}
                >
                  {isPinned ? <Pin className="size-4" /> : <PinOff className="size-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>{isPinned ? "Unpin" : "Pin"}</TooltipContent>
            </Tooltip>
          )}

          {hasOverflowActions && (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      aria-label="More actions"
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>More actions</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {onToggleFavorite && (
                  <DropdownMenuItem onClick={onToggleFavorite}>
                    <Heart className={isFavorite ? "fill-current" : ""} />
                    {isFavorite ? "Unfavorite" : "Favorite"}
                  </DropdownMenuItem>
                )}
                {onShare && (
                  <DropdownMenuItem onClick={onShare}>
                    <Share2 />
                    Copy link
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem variant="destructive" onClick={onDelete}>
                    <Trash2 />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </Card>
  );
};

export default NoteCard;
