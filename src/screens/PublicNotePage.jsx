"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Eye, LogIn, Pencil } from "lucide-react";
import { subscribeNoteById, incrementViewCount } from "@/features/notes/services/notesService";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import ContentRenderer from "@/components/ContentRenderer";
import ExportMenu from "@/components/ExportMenu";
import AdPlacement from "@/features/monetization/components/AdPlacement";
import NoteDiscussionForum from "@/features/discussions/components/NoteDiscussionForum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const PublicNotePage = ({ id }) => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  const { userProfile, currentUser } = useAuth();
  const [isNamePromptOpen, setIsNamePromptOpen] = useState(false);
  const [visitorName, setVisitorName] = useState("");

  useEffect(() => {
    let hasIncremented = false;
    const unsubscribe = subscribeNoteById(id, (fetchedNote) => {
      if (fetchedNote && fetchedNote.visibility === "public") {
        setNote(fetchedNote);
        setLoading(false);

        if (!hasIncremented) {
          if (userProfile) {
            incrementViewCount(id, userProfile).catch((err) => console.error("View increment error:", err));
            hasIncremented = true;
          } else {
            const storedName = localStorage.getItem("guest_viewer_name");
            const storedId = localStorage.getItem("guest_viewer_id");

            if (storedName) {
              incrementViewCount(id, {
                uid: storedId || "guest_" + Date.now(),
                displayName: storedName,
              }).catch((err) => console.error("View increment error:", err));
              hasIncremented = true;
            } else {
              setIsNamePromptOpen(true);
            }
          }
        }
      } else {
        setNote(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id, userProfile]);

  const handleSubmitVisitorName = () => {
    const trimmedName = visitorName.trim() || "Guest Reader";
    const guestId = "guest_" + Date.now();

    localStorage.setItem("guest_viewer_name", trimmedName);
    localStorage.setItem("guest_viewer_id", guestId);

    incrementViewCount(id, {
      uid: guestId,
      displayName: trimmedName,
    }).catch((err) => console.error("View increment error:", err));

    setIsNamePromptOpen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Public note link copied!");
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-24">
        <div className="size-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="mx-auto max-w-sm pt-24 text-center">
        <h1 className="mb-2 text-2xl font-extrabold">Note Unavailable</h1>
        <p className="mb-6 text-muted-foreground">
          This note does not exist or was made private by the author.
        </p>
        <Button asChild>
          <Link href="/">
            <LogIn />
            Go to Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl py-6 sm:py-12">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft />
            Back to Application
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {currentUser?.uid === note.authorId && (
            <Button variant="outline" asChild>
              <Link href={`/note/${note.id}/edit`}>
                <Pencil />
                Edit Note
              </Link>
            </Button>
          )}
          <ExportMenu noteTitle={note.title || "Untitled Document"} htmlContent={note.content} />
          <Button onClick={handleCopyLink}>
            <Copy />
            Share Link
          </Button>
        </div>
      </div>

      <h1 className="mb-6 text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl">
        {note.title || "Untitled Document"}
      </h1>

      <div className="mb-6 flex items-center gap-3">
        <Avatar className="size-12">
          <AvatarFallback className="bg-muted text-foreground">
            {note.authorName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold">{note.authorName || "Author"}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Updated {note.updatedAt?.toDate ? format(note.updatedAt.toDate(), "MMM dd, yyyy") : "Recently"}
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="flex items-center gap-1 font-semibold">
              <Eye className="size-3.5" />
              {note.viewCount || 0} views
            </span>
          </div>
        </div>
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {note.tags.map((t) => (
            <Badge key={t} variant="outline" className="rounded-md">
              #{t}
            </Badge>
          ))}
        </div>
      )}

      <AdPlacement placement="above_article" creatorUid={note.authorId || note.userId} />

      <ContentRenderer content={note.content} />

      <AdPlacement placement="below_article" creatorUid={note.authorId || note.userId} />

      <NoteDiscussionForum noteId={note.id} noteAuthorId={note.authorId} />

      {/* Guest Reader Name Modal */}
      <Dialog open={isNamePromptOpen}>
        <DialogContent showCloseButton={false} onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Welcome to OpenNotes Reader</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Please enter your name to register as a reader for this document.
          </p>
          <Input
            autoFocus
            placeholder="Your Name..."
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmitVisitorName()}
          />
          <DialogFooter>
            <Button className="w-full" onClick={handleSubmitVisitorName}>
              Start Reading
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicNotePage;
