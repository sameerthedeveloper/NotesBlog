"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { subscribeUserNotes } from "@/features/notes/services/notesService";
import { stripHtmlTags } from "@/utils/sanitizer";
import NoteCard from "@/components/NoteCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeUserNotes(currentUser.uid, {}, (fetchedNotes) => {
      setNotes(fetchedNotes);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleSearchChange = (val) => {
    setQuery(val);
    router.replace(val ? `/search?q=${encodeURIComponent(val)}` : "/search");
  };

  const results = notes.filter((note) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();

    const titleMatch = note.title?.toLowerCase().includes(q);
    const tagMatch = note.tags?.some((t) => t.toLowerCase().includes(q));
    const plainText = stripHtmlTags(note.content).toLowerCase();
    const contentMatch = plainText.includes(q);

    return titleMatch || tagMatch || contentMatch;
  });

  return (
    <div className="w-full">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight sm:text-3xl">HTML Content Search</h1>
      <p className="mb-6 text-muted-foreground">
        Search inside document titles, tags, and raw rich text content.
      </p>

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-primary" />
        <Input
          placeholder="Type to search HTML notes..."
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-12 rounded-2xl pl-11 text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleSearchChange("")}
            className="absolute top-1/2 right-2 -translate-y-1/2"
          >
            <X />
          </Button>
        )}
      </div>

      <h2 className="mb-4 text-lg font-bold">
        Found {results.length} result{results.length === 1 ? "" : "s"}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 w-full rounded-2xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-border p-12 text-center">
          <h3 className="text-lg font-bold">No matching notes found</h3>
          <p className="text-sm text-muted-foreground">Try a different search term or check spelling.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {results.map((note) => (
            <NoteCard key={note.id} note={note} onClick={() => router.push(`/note/${note.id}/edit`)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
