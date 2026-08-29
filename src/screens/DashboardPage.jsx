"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Search,
  Pin,
  Heart,
  NotebookText,
  Eye,
  LayoutGrid,
  List as ListIcon,
  Sparkles as MigrateIcon,
  ChevronRight,
  FileText,
  MoreVertical,
  Share2,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { subscribeUserNotes, deleteNote, togglePin, toggleFavorite } from "@/features/notes/services/notesService";
import NoteCardGrid from "@/components/NoteCardGrid";
import { runNotesMigration } from "@/utils/migration";
import { stripHtmlTags } from "@/utils/sanitizer";
import { extractNoteMetadata } from "@/utils/metadataExtractor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const OverviewCard = ({ title, count, icon: Icon, iconClass }) => (
  <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md">
    <div className={cn("flex size-9 items-center justify-center rounded-xl", iconClass)}>
      <Icon className="size-4.5" />
    </div>
    <div className="mt-2">
      <p className="text-2xl leading-none font-bold tracking-tight sm:text-3xl">{count}</p>
      <p className="mt-1 truncate font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">{title}</p>
    </div>
  </div>
);

export const DashboardPage = () => {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");

  const [migrating, setMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState({ current: 0, total: 0, msg: "" });

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeUserNotes(currentUser.uid, {}, (userNotes) => {
      setNotes(userNotes);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      toast.success("Note deleted successfully");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const handleTogglePin = async (noteId, currentStatus) => {
    try {
      await togglePin(noteId, !currentStatus);
    } catch {
      toast.error("Failed to update pin status");
    }
  };

  const handleToggleFavorite = async (noteId, currentStatus) => {
    try {
      await toggleFavorite(noteId, !currentStatus);
    } catch {
      toast.error("Failed to update favorite status");
    }
  };

  const handleRunMigration = async () => {
    setMigrating(true);
    try {
      const res = await runNotesMigration((cur, tot, msg) => {
        setMigrationProgress({ current: cur, total: tot, msg });
      });
      toast.success(`Migration completed! ${res.converted} notes converted to HTML.`);
    } catch (err) {
      console.error(err);
      toast.error("Migration failed");
    } finally {
      setMigrating(false);
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (filterType === "pinned" && !n.isPinned) return false;
    if (filterType === "favorites" && !n.isFavorite) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        n.title?.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q)) ||
        n.content?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalViews = notes.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);
  const pinnedCount = notes.filter((n) => n.isPinned).length;
  const favoriteCount = notes.filter((n) => n.isFavorite).length;

  return (
    <div className="w-full pb-24 sm:pb-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl leading-tight font-extrabold tracking-tight sm:text-3xl">
            Welcome back, {currentUser?.displayName?.split(" ")[0] || "User"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage, edit, and share your notes.</p>
        </div>

        <div className="hidden gap-2 sm:flex">
          <Button variant="outline" onClick={handleRunMigration} disabled={migrating}>
            <MigrateIcon />
            Auto Convert Markdown
          </Button>
          <Button onClick={() => router.push("/note/new")}>
            <Plus />
            New Note
          </Button>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Recent Notes</h2>
        <Button variant="link" size="sm" className="gap-1 text-primary" onClick={() => router.push("/notes")}>
          View all
          <ChevronRight className="size-3.5" />
        </Button>
      </div>

      <div className="mb-5 flex items-center justify-between gap-2">
        <Tabs value={filterType} onValueChange={setFilterType}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="hidden items-center gap-2 sm:flex">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 pl-9"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(viewMode === "grid" && "bg-primary/10 text-primary")}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(viewMode === "list" && "bg-primary/10 text-primary")}
            onClick={() => setViewMode("list")}
          >
            <ListIcon />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <NotebookText className="mx-auto mb-3 size-12 text-muted-foreground/40" />
          <h3 className="text-base font-bold">No notes found</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {searchQuery ? "No notes matching your search criteria." : "Create your first rich HTML note to get started!"}
          </p>
          <Button onClick={() => router.push("/note/new")}>
            <Plus />
            Create Note
          </Button>
        </div>
      ) : (
        <div className="hidden sm:block">
          <NoteCardGrid
            notes={filteredNotes}
            viewMode={viewMode}
            onCardClick={(note) => router.push(`/note/${note.id}`)}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePin}
            onToggleFavorite={handleToggleFavorite}
            onCreateClick={() => router.push("/note/new")}
          />
        </div>
      )}

      {/* Mobile compact list (shown regardless of loading/empty state above sm breakpoint being hidden) */}
      {!loading && filteredNotes.length > 0 && (
        <div className="flex flex-col gap-2 sm:hidden">
          {filteredNotes.map((note) => {
            const meta = extractNoteMetadata(note.content || "");
            const excerpt = meta.excerpt || stripHtmlTags(note.content || "").slice(0, 80);
            const dateStr = note.updatedAt?.toDate ? format(note.updatedAt.toDate(), "MMM d · h:mm a") : "Just now";

            return (
              <button
                key={note.id}
                onClick={() => router.push(`/note/${note.id}`)}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3 text-left active:scale-[0.99]"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{note.title || "Untitled Note"}</p>
                    <p className="truncate text-xs text-muted-foreground">{excerpt || "No content preview"}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/70">{dateStr}</p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <span
                      role="button"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                    >
                      <MoreVertical className="size-4" />
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/note/${note.id}`)}>
                      <FileText />
                      Read Note
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/note/${note.id}/edit`)}>
                      <Pencil />
                      Edit Note
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const path = note.visibility === "public" ? `/public/note/${note.id}` : `/note/${note.id}`;
                        navigator.clipboard.writeText(`${window.location.origin}${path}`);
                        toast.success("Link copied!");
                      }}
                    >
                      <Share2 />
                      Share Link
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => handleDeleteNote(note.id)}>
                      <Trash2 />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Overview</h2>
          <Button variant="link" size="sm" className="gap-1 text-primary" onClick={() => router.push("/notes")}>
            View all
            <ChevronRight className="size-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <OverviewCard title="Total Notes" count={notes.length} icon={NotebookText} iconClass="bg-primary/10 text-primary" />
          <OverviewCard title="Pinned Notes" count={pinnedCount} icon={Pin} iconClass="bg-muted text-foreground" />
          <OverviewCard title="Favorites" count={favoriteCount} icon={Heart} iconClass="bg-muted text-foreground" />
          <OverviewCard title="Total Views" count={totalViews} icon={Eye} iconClass="bg-muted text-foreground" />
        </div>
      </div>

      <Dialog open={migrating}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Converting Markdown Notes to HTML</DialogTitle>
          </DialogHeader>
          <p className="mb-2 text-sm text-muted-foreground">
            {migrationProgress.msg || "Processing Firestore notes..."}
          </p>
          <Progress value={migrationProgress.total ? (migrationProgress.current / migrationProgress.total) * 100 : 0} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
