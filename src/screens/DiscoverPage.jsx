"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import NoteCard from "@/components/NoteCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  subscribePublicNotes,
  togglePin,
  toggleFavorite,
  subscribeUserBookmarks,
  subscribeUserPins,
} from "@/features/notes/services/notesService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const EmptyState = () => (
  <div className="flex flex-col items-center px-4 py-24 text-center">
    <Compass className="mb-6 size-28 text-primary/15" />
    <h2 className="mb-1 text-2xl font-bold tracking-tight">No public notes yet</h2>
    <p className="max-w-sm font-medium text-muted-foreground">
      Check back later to discover new content shared by the community.
    </p>
  </div>
);

const DiscoverPage = () => {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [notes, setNotes] = useState([]);
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [userPins, setUserPins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubPublic = subscribePublicNotes((fetchedNotes) => {
      setNotes(fetchedNotes);
      setLoading(false);
    });

    let unsubBookmarks = () => {};
    let unsubPins = () => {};

    if (currentUser?.uid) {
      unsubBookmarks = subscribeUserBookmarks(currentUser.uid, (bm) => setUserBookmarks(bm));
      unsubPins = subscribeUserPins(currentUser.uid, (pins) => setUserPins(pins));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing derived state when there's no signed-in user to subscribe for
      setUserBookmarks([]);
      setUserPins([]);
    }

    return () => {
      unsubPublic();
      unsubBookmarks();
      unsubPins();
    };
  }, [currentUser]);

  const bookmarkedSet = new Set(userBookmarks.map((b) => b.id || b.noteId));
  const pinnedSet = new Set(userPins.map((p) => p.id || p.noteId));

  const handleTogglePin = async (note) => {
    if (!currentUser) {
      toast.error("Please login to pin notes.");
      return;
    }
    const currentlyPinned = pinnedSet.has(note.id) || (note.authorId === currentUser.uid && note.isPinned);
    try {
      await togglePin(note.id, !currentlyPinned, currentUser.uid, note);
      toast.success(!currentlyPinned ? "Pinned to your collection" : "Unpinned");
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error(err);
      toast.error("Error updating pin");
    }
  };

  const handleToggleFavorite = async (note) => {
    if (!currentUser) {
      toast.error("Please login to bookmark notes.");
      return;
    }
    const currentlyFav = bookmarkedSet.has(note.id) || (note.authorId === currentUser.uid && note.isFavorite);
    try {
      await toggleFavorite(note.id, !currentlyFav, currentUser.uid, note);
      toast.success(!currentlyFav ? "Added to favorites & bookmarks" : "Removed from favorites");
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error(err);
      toast.error("Error updating favorites");
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 border-b border-border pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Discover</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {notes.map((note) => {
            const isNoteFav = bookmarkedSet.has(note.id) || (note.authorId === currentUser?.uid && note.isFavorite);
            const isNotePinned = pinnedSet.has(note.id) || (note.authorId === currentUser?.uid && note.isPinned);
            const displayNote = { ...note, isFavorite: isNoteFav, isPinned: isNotePinned };

            return (
              <NoteCard
                key={note.id}
                note={displayNote}
                onClick={() => router.push(`/public/note/${note.id}`)}
                onDelete={() => toast.error("You cannot delete public notes.")}
                onTogglePin={() => handleTogglePin(note)}
                onToggleFavorite={() => handleToggleFavorite(note)}
                onShare={(e) => {
                  if (e) e.stopPropagation();
                  const publicUrl = `${window.location.origin}/public/note/${note.id}`;
                  navigator.clipboard.writeText(publicUrl);
                  toast.success("Link copied!");
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
