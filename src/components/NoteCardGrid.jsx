"use client";

import { useRef, useEffect } from "react";
import { NotebookText, Plus, Pin, Heart, Share2, Trash2, Globe, Lock, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import NoteCard from "@/components/NoteCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { staggerReveal } from "@/utils/animationManager";
import { stripHtmlTags } from "@/utils/sanitizer";
import { cn } from "@/lib/utils";

function NoteListRow({ note, selectable, selected, onToggleSelect, onCardClick, onDelete, onTogglePin, onToggleFavorite, onShare }) {
  const excerpt = stripHtmlTags(note.content || "").slice(0, 100);
  const hasOverflowActions = onToggleFavorite || onShare || onDelete;

  return (
    <div
      className="note-card-item group flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
      role={onCardClick ? "button" : undefined}
      onClick={onCardClick}
    >
      {selectable && (
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggleSelect(note.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${note.title || "note"}`}
        />
      )}

      <Badge
        variant={note.visibility === "public" ? "outline" : "secondary"}
        className="hidden shrink-0 gap-1 rounded-md text-[10px] font-semibold sm:flex"
      >
        {note.visibility === "public" ? <Globe className="size-3" /> : <Lock className="size-3" />}
        {note.visibility === "public" ? "Public" : "Private"}
      </Badge>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{note.title || "Untitled Note"}</p>
        <p className="truncate text-xs text-muted-foreground">{excerpt || "No content preview"}</p>
      </div>

      <span className="hidden shrink-0 font-mono text-xs font-medium text-muted-foreground/70 sm:block">
        {note.updatedAt?.toDate ? formatDistanceToNow(note.updatedAt.toDate()) + " ago" : "Recently"}
      </span>

      <div
        className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 md:has-data-[state=open]:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {onTogglePin && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onTogglePin}
                aria-label={note.isPinned ? "Unpin" : "Pin"}
                className={cn("rounded-lg p-1.5 hover:bg-muted", note.isPinned ? "text-primary" : "text-muted-foreground")}
              >
                <Pin className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{note.isPinned ? "Unpin" : "Pin"}</TooltipContent>
          </Tooltip>
        )}

        {hasOverflowActions && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button aria-label="More actions" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                    <MoreHorizontal className="size-4" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>More actions</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              {onToggleFavorite && (
                <DropdownMenuItem onClick={onToggleFavorite}>
                  <Heart className={note.isFavorite ? "fill-current" : ""} />
                  {note.isFavorite ? "Unfavorite" : "Favorite"}
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
  );
}

export const NoteCardGrid = ({
  notes = [],
  loading = false,
  viewMode = "grid",
  searchQuery = "",
  onDeleteNote,
  onTogglePin,
  onToggleFavorite,
  onCardClick,
  onCreateClick,
  emptyMessage = "No notes found",
  selectable = false,
  selectedIds,
  onToggleSelect,
}) => {
  const gridRef = useRef(null);

  useEffect(() => {
    if (gridRef.current && notes.length > 0) {
      const cards = gridRef.current.querySelectorAll(".note-card-item");
      staggerReveal(cards, { stagger: 0.04, duration: 0.3 });
    }
  }, [notes, viewMode]);

  if (loading) {
    return (
      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-60 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="my-2 w-full rounded-2xl border border-border bg-card p-12 text-center">
        <NotebookText className="mx-auto mb-3 size-14 text-muted-foreground/40" />
        <h3 className="text-lg font-bold">{emptyMessage}</h3>
        <p className="mx-auto mb-6 max-w-sm text-sm text-muted-foreground">
          {searchQuery
            ? "No notes matching your search query. Try refining your filters."
            : "Create your first rich HTML note to get started!"}
        </p>
        {onCreateClick && (
          <Button onClick={onCreateClick}>
            <Plus />
            Create Note
          </Button>
        )}
      </div>
    );
  }

  const shareNote = (note) => {
    const path = note.visibility === "public" ? `/public/note/${note.id}` : `/note/${note.id}`;
    navigator.clipboard.writeText(`${window.location.origin}${path}`);
    toast.success("Note link copied to clipboard!");
  };

  if (viewMode === "list") {
    return (
      <div ref={gridRef} className="mt-1 mb-2 w-full divide-y divide-border rounded-2xl border border-border bg-card">
        {notes.map((note) => (
          <NoteListRow
            key={note.id}
            note={note}
            selectable={selectable}
            selected={selectedIds?.has(note.id)}
            onToggleSelect={onToggleSelect}
            onCardClick={onCardClick ? () => onCardClick(note) : undefined}
            onDelete={onDeleteNote ? () => onDeleteNote(note.id) : null}
            onTogglePin={onTogglePin ? () => onTogglePin(note.id, note.isPinned) : null}
            onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(note.id, note.isFavorite) : null}
            onShare={() => shareNote(note)}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="mt-1 mb-2 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {notes.map((note) => (
        <div key={note.id} className="note-card-item relative flex flex-col">
          {selectable && (
            <Checkbox
              checked={selectedIds?.has(note.id)}
              onCheckedChange={() => onToggleSelect(note.id)}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-3 left-3 z-10 bg-background"
              aria-label={`Select ${note.title || "note"}`}
            />
          )}
          <NoteCard
            note={note}
            onClick={() => (onCardClick ? onCardClick(note) : null)}
            onDelete={onDeleteNote ? () => onDeleteNote(note.id) : null}
            onTogglePin={onTogglePin ? () => onTogglePin(note.id, note.isPinned) : null}
            onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(note.id, note.isFavorite) : null}
            onShare={() => shareNote(note)}
          />
        </div>
      ))}
    </div>
  );
};

export default NoteCardGrid;
