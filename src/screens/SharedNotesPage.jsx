"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Share2 } from "lucide-react";
import { subscribePublicNotes } from "@/features/notes/services/notesService";
import NoteCard from "@/components/NoteCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const SharedNotesPage = () => {
  const [publicNotes, setPublicNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = subscribePublicNotes((notes) => {
      setPublicNotes(notes);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredNotes = publicNotes.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q) ||
      n.authorName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Shared &amp; Public Notes</h1>
        <p className="text-muted-foreground">
          Explore notes published publicly by the OpenNotes community.
        </p>
      </div>

      <div className="relative mb-6 max-w-100">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter shared notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-52 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="rounded-2xl border border-border p-12 text-center">
          <Share2 className="mx-auto mb-3 size-12 text-muted-foreground/40" />
          <h3 className="text-lg font-bold">No public notes found</h3>
          <p className="text-sm text-muted-foreground">Publish a note to web to see it showcased here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => router.push(`/public/note/${note.id}`)}
              onShare={() => {
                navigator.clipboard.writeText(`${window.location.origin}/public/note/${note.id}`);
                toast.success("Public note link copied!");
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedNotesPage;
