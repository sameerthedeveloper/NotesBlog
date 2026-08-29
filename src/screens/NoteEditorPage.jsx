"use client";

import { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  Share2,
  Globe,
  Lock,
  History,
  Pin,
  PinOff,
  Heart,
  MoreVertical,
  Eye,
  Pencil,
  Check,
  X,
  Loader2,
  Zap,
} from "lucide-react";
import TagInput from "@/components/TagInput";
import ExportMenu from "@/components/ExportMenu";
import ContentRenderer from "@/components/ContentRenderer";
import { useAuth } from "@/context/AuthContext";
import {
  createNote,
  updateNote,
  getNoteById,
  deleteNote,
  subscribeNoteViews,
} from "@/features/notes/services/notesService";
import { extractNoteMetadata } from "@/utils/metadataExtractor";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const LazyTipTapEditor = lazy(() => import("@/components/TipTapEditor"));

export const NoteEditorPage = ({ id }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [visibility, setVisibility] = useState("private");
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [versions, setVersions] = useState([]);

  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const isEditRoute = pathname.endsWith("/edit");
  const [isEditing, setIsEditing] = useState(!id || isEditRoute);

  const [viewersDialogOpen, setViewersDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recentViews, setRecentViews] = useState([]);

  useEffect(() => {
    if (!id) return;
    const fetchNote = async () => {
      try {
        const note = await getNoteById(id);
        if (note) {
          if (note.authorId !== currentUser.uid) {
            if (note.visibility === "public") {
              router.replace(`/public/note/${id}`);
              return;
            }
            toast.error("You do not have permission to edit this note.");
            router.push("/dashboard");
            return;
          }
          setTitle(note.title || "");
          setContent(note.content || "");
          setTags(note.tags || []);
          setVisibility(note.visibility || "private");
          setIsPinned(note.isPinned || false);
          setIsFavorite(note.isFavorite || false);
          setVersions(note.versions || []);
        } else {
          toast.error("Note not found");
          router.push("/notes");
        }
      } catch {
        toast.error("Failed to load note");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, currentUser.uid, router]);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = subscribeNoteViews(id, (views) => {
      setRecentViews(views);
    });
    return () => unsubscribe();
  }, [id]);

  const metaStats = useMemo(() => extractNoteMetadata(content), [content]);

  const handleSaveContent = async (updatedHtml = content) => {
    if (!currentUser?.uid) {
      toast.error("You must be signed in to save notes.");
      return;
    }

    setSaving(true);
    const noteData = {
      title: title || "Untitled Note",
      content: updatedHtml,
      tags,
      visibility,
      isPinned,
      isFavorite,
      authorId: currentUser.uid,
      authorName: currentUser.displayName || "Author",
    };

    try {
      if (id) {
        await updateNote(id, noteData, { saveVersion: true });
        toast.success("Note saved successfully!");
      } else {
        const newId = await createNote(currentUser.uid, noteData);
        toast.success("Note created!");
        router.replace(`/note/${newId}`);
      }
    } catch (error) {
      console.error("Save note error:", error);
      toast.error("Failed to save note to Firestore");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    if (visibility !== "public") {
      toast.error("Please set note visibility to 'Public' to share it.");
      return;
    }
    const publicUrl = `${window.location.origin}/public/note/${id}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public note link copied to clipboard!");
  };

  const handleDelete = async () => {
    try {
      await deleteNote(id);
      toast.success("Note deleted");
      router.push("/notes");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderEditorForm = () => (
    <div className="p-1 sm:p-0">
      <div className="mb-6">
        <Input
          placeholder="Note Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 h-auto border-none px-0 text-2xl font-extrabold shadow-none focus-visible:ring-0 sm:text-4xl"
        />

        <div className="mb-4">
          <TagInput tags={tags} setTags={setTags} />
        </div>

        <div className="flex w-fit items-center gap-3 rounded-xl bg-muted px-4 py-2.5">
          <Switch
            checked={visibility === "public"}
            onCheckedChange={(checked) => setVisibility(checked ? "public" : "private")}
          />
          <div className="flex items-center gap-1.5">
            {visibility === "public" ? (
              <Globe className="size-4 text-primary" />
            ) : (
              <Lock className="size-4 text-muted-foreground" />
            )}
            <span className="text-sm font-semibold">
              {visibility === "public" ? "Public (Anyone with link)" : "Private (Only Me)"}
            </span>
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-border p-12 text-center">
            <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              Loading Rich Text Editor...
            </p>
          </div>
        }
      >
        <LazyTipTapEditor
          initialContent={content}
          onChange={(html) => setContent(html)}
          onSave={(html) => handleSaveContent(html)}
          onMetadataExtracted={(meta) => {
            if ((!title || title.trim() === "" || title === "Untitled Note") && meta.title) {
              setTitle(meta.title);
            }
          }}
          autoSave={Boolean(id)}
        />
      </Suspense>
    </div>
  );

  return (
    <div className="w-full">
      <div className="mb-6 sticky top-4 z-10 w-full rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/notes")}>
              <ArrowLeft />
            </Button>
            <h1 className="max-w-45 truncate text-lg font-bold sm:max-w-100">
              {title || (id ? "Note Reader" : "Create Note")}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {id && (
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X /> : <Pencil />}
                {isEditing ? "Done" : "Edit"}
              </Button>
            )}

            <ExportMenu noteTitle={title || "Untitled Note"} htmlContent={content} />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPinned(!isPinned)}
              className={isPinned ? "text-primary" : "text-muted-foreground"}
              aria-label={isPinned ? "Unpin Note" : "Pin Note"}
            >
              {isPinned ? <Pin /> : <PinOff />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className={isFavorite ? "text-destructive" : "text-muted-foreground"}
              aria-label={isFavorite ? "Unfavorite" : "Mark Favorite"}
            >
              <Heart className={isFavorite ? "fill-current" : ""} />
            </Button>

            {id && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewersDialogOpen(true)}
                aria-label="Real-Time Viewers"
              >
                <Eye />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 />
                  Copy Public Link
                </DropdownMenuItem>
                {versions.length > 0 && (
                  <DropdownMenuItem onClick={() => setHistoryDialogOpen(true)}>
                    <History />
                    Version History
                  </DropdownMenuItem>
                )}
                {id && (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 />
                    Delete Note
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {isEditing && (
              <Button onClick={() => handleSaveContent(content)} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" /> : <Check />}
                {saving ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {!isEditing ? (
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-6">
            <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
              {title || "Untitled Note"}
            </h1>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1 font-semibold text-primary">
                <Zap className="size-3" />
                {metaStats.readingTimeMinutes} min read
              </Badge>
              <Badge variant="outline">{metaStats.wordCount} words</Badge>
              <Badge variant="outline">Level: {metaStats.difficultyLevel}</Badge>
              <Badge variant={visibility === "public" ? "default" : "secondary"}>
                {visibility === "public" ? "Public" : "Private"}
              </Badge>
            </div>

            {tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {tags.map((t, idx) => (
                  <Badge key={idx} variant="secondary" className="rounded-md">
                    #{t}
                  </Badge>
                ))}
              </div>
            )}

            <div className="my-6 h-px bg-border" />
          </div>

          <ContentRenderer content={content} />
        </div>
      ) : (
        renderEditorForm()
      )}

      {/* Viewers Analytics Dialog */}
      <Dialog open={viewersDialogOpen} onOpenChange={setViewersDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recent Viewers &amp; Analytics</DialogTitle>
          </DialogHeader>
          {recentViews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No viewers recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {recentViews.map((v) => (
                <div key={v.id} className="flex items-center gap-3 py-2">
                  <Avatar>
                    <AvatarImage src={v.photoURL || undefined} />
                    <AvatarFallback>{v.displayName?.charAt(0) || "V"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{v.displayName || "Anonymous Viewer"}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.viewedAt
                        ? `Viewed ${formatDistanceToNow(v.viewedAt.toDate ? v.viewedAt.toDate() : new Date(v.viewedAt))} ago`
                        : "Just now"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewersDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Note Version History</DialogTitle>
          </DialogHeader>
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No previous versions recorded.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {versions.map((ver, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 py-2">
                  <div>
                    <p className="text-sm font-medium">
                      {ver.title || `Version ${versions.length - idx}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ver.timestamp
                        ? `Saved ${formatDistanceToNow(ver.timestamp.toDate ? ver.timestamp.toDate() : new Date(ver.timestamp))} ago`
                        : `Version #${idx + 1}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setContent(ver.content || "");
                      setTitle(ver.title || title);
                      setHistoryDialogOpen(false);
                      toast.success("Restored version from history!");
                    }}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NoteEditorPage;
