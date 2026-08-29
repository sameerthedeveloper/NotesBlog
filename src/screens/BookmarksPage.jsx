"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  subscribeUserNotes,
  subscribeUserBookmarks,
  deleteNote,
  togglePin,
  toggleFavorite,
} from "@/features/notes/services/notesService";
import NoteCard from "@/components/NoteCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const BookmarksPage = () => {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [ownNotes, setOwnNotes] = useState([]);
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    let loadedCount = 0;
    const checkDone = () => {
      loadedCount++;
      if (loadedCount >= 2) setLoading(false);
    };

    const unsubNotes = subscribeUserNotes(currentUser.uid, {}, (fetchedNotes) => {
      setOwnNotes(fetchedNotes);
      checkDone();
    });

    const unsubBookmarks = subscribeUserBookmarks(currentUser.uid, (fetchedBookmarks) => {
      setUserBookmarks(fetchedBookmarks);
      checkDone();
    });

    return () => {
      unsubNotes();
      unsubBookmarks();
    };
  }, [currentUser]);

  const ownFavs = ownNotes.filter((n) => n.isFavorite);
  const ownFavIds = new Set(ownFavs.map((n) => n.id));

  const externalBookmarks = userBookmarks
    .filter((bm) => !ownFavIds.has(bm.id || bm.noteId))
    .map((bm) => ({
      id: bm.noteId || bm.id,
      title: bm.title || "Bookmarked Note",
      content: bm.content || "",
      authorId: bm.authorId || "",
      authorName: bm.authorName || "Community Member",
      visibility: bm.visibility || "public",
      tags: bm.tags || [],
      isFavorite: true,
      isPinned: !!bm.isPinned,
      updatedAt: bm.updatedAt,
    }));

  const allBookmarks = [...ownFavs, ...externalBookmarks];

  const handleDelete = async (note) => {
    if (note.authorId && note.authorId !== currentUser?.uid) {
      toast.error("You can only remove this note from your bookmarks.");
      await toggleFavorite(note.id, false, currentUser.uid, note);
      return;
    }
    await deleteNote(note.id);
    toast.success("Note deleted");
  };

  const handleToggleFavorite = async (note) => {
    try {
      await toggleFavorite(note.id, !note.isFavorite, currentUser.uid, note);
      toast.success(!note.isFavorite ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch {
      toast.error("Error updating bookmark");
    }
  };

  const handleTogglePin = async (note) => {
    try {
      await togglePin(note.id, !note.isPinned, currentUser.uid, note);
      toast.success(!note.isPinned ? "Pinned" : "Unpinned");
    } catch {
      toast.error("Error updating pin");
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Bookmarks &amp; Favorites</h1>
        <p className="text-muted-foreground">
          Quickly access your starred notes and public notes saved from Discover.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 w-full rounded-2xl" />
          ))}
        </div>
      ) : allBookmarks.length === 0 ? (
        <div className="rounded-2xl border border-border p-12 text-center">
          <Bookmark className="mx-auto mb-3 size-12 text-muted-foreground/40" />
          <h3 className="text-lg font-bold">No bookmarks yet</h3>
          <p className="text-sm text-muted-foreground">
            Star your notes or save public notes from the Discover section to view them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {allBookmarks.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => {
                if (note.authorId && note.authorId !== currentUser?.uid) {
                  router.push(`/public/note/${note.id}`);
                } else {
                  router.push(`/note/${note.id}`);
                }
              }}
              onDelete={() => handleDelete(note)}
              onToggleFavorite={() => handleToggleFavorite(note)}
              onTogglePin={() => handleTogglePin(note)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
