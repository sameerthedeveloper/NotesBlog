"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, LayoutGrid, List as ListIcon, Pin, Heart, Trash2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { subscribeUserNotes, deleteNote, togglePin, toggleFavorite } from "@/features/notes/services/notesService";
import NoteCardGrid from "@/components/NoteCardGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const NotesPage = () => {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const itemsPerPage = 9;

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeUserNotes(currentUser.uid, { sortField: sortBy }, (userNotes) => {
      setNotes(userNotes);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser, sortBy]);

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const handleTogglePin = async (noteId, isPinned) => {
    await togglePin(noteId, !isPinned);
  };

  const handleToggleFavorite = async (noteId, isFavorite) => {
    await toggleFavorite(noteId, !isFavorite);
  };

  const handleToggleSelect = (noteId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) next.delete(noteId);
      else next.add(noteId);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkPin = async () => {
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map((id) => togglePin(id, true)));
      toast.success(`Pinned ${ids.length} note${ids.length === 1 ? "" : "s"}`);
      clearSelection();
    } catch {
      toast.error("Failed to pin selected notes");
    }
  };

  const handleBulkFavorite = async () => {
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map((id) => toggleFavorite(id, true)));
      toast.success(`Added ${ids.length} note${ids.length === 1 ? "" : "s"} to favorites`);
      clearSelection();
    } catch {
      toast.error("Failed to favorite selected notes");
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    setBulkDeleteOpen(false);
    try {
      await Promise.all(ids.map((id) => deleteNote(id)));
      toast.success(`Deleted ${ids.length} note${ids.length === 1 ? "" : "s"}`);
      clearSelection();
    } catch {
      toast.error("Failed to delete selected notes");
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q) ||
      n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const pageCount = Math.ceil(filteredNotes.length / itemsPerPage);
  const paginatedNotes = filteredNotes.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">My Notes Library</h1>
          <p className="text-muted-foreground">Organize, search, and manage all your rich text HTML notes.</p>
        </div>

        <Button onClick={() => router.push("/note/new")}>
          <Plus />
          New Note
        </Button>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="text-sm font-semibold text-foreground">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleBulkPin}>
              <Pin />
              Pin
            </Button>
            <Button size="sm" variant="outline" onClick={handleBulkFavorite}>
              <Heart />
              Favorite
            </Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={() => setBulkDeleteOpen(true)}>
              <Trash2 />
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={clearSelection} aria-label="Clear selection">
              <X />
            </Button>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-border p-4">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="relative w-full sm:w-75">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-42.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">Recently Updated</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              className={cn(viewMode === "grid" && "bg-primary/10 text-primary")}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(viewMode === "list" && "bg-primary/10 text-primary")}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <ListIcon />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-52 w-full rounded-2xl" />
          ))}
        </div>
      ) : paginatedNotes.length === 0 ? (
        <div className="rounded-2xl border border-border p-12 text-center">
          <h3 className="text-lg font-bold">No notes found</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Try adjusting your search criteria or create a new note.
          </p>
          <Button onClick={() => router.push("/note/new")}>Create Note</Button>
        </div>
      ) : (
        <>
          <NoteCardGrid
            notes={paginatedNotes}
            loading={loading}
            viewMode={viewMode}
            searchQuery={searchQuery}
            onCardClick={(note) => router.push(`/note/${note.id}`)}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePin}
            onToggleFavorite={handleToggleFavorite}
            onCreateClick={() => router.push("/note/new")}
            selectable
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
          />

          {pageCount > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    className={page === pageCount ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} note{selectedIds.size === 1 ? "" : "s"}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotesPage;
