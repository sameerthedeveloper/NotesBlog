"use client";

import { useState } from "react";
import { Send, Code, Bold, Italic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ReplyComposer = ({
  onSubmit,
  parentReplyAuthor = null,
  onCancelParent = null,
  placeholder = "Write a constructive reply...",
}) => {
  const [content, setContent] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleInsertFormatting = (prefix, suffix = "") => {
    setContent((prev) => `${prev}${prefix}text${suffix}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !codeSnippet.trim()) {
      toast.error("Please enter a reply before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        content: content.trim(),
        codeSnippet: codeSnippet.trim(),
      });
      setContent("");
      setCodeSnippet("");
      setShowCode(false);
      if (onCancelParent) onCancelParent();
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error(err);
      toast.error("Failed to post reply.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-4">
      {parentReplyAuthor && (
        <div className="mb-3 flex items-center gap-1.5">
          <Badge variant="outline" className="gap-1.5 font-semibold text-primary">
            Replying to @{parentReplyAuthor}
            <button type="button" onClick={onCancelParent} className="text-muted-foreground hover:text-foreground">
              ×
            </button>
          </Badge>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Textarea
          rows={3}
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="text-sm"
        />

        {showCode && (
          <Textarea
            rows={4}
            placeholder="// Paste code snippet or LaTeX here..."
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            className="bg-muted font-mono text-sm"
          />
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              title="Bold (**text**)"
              onClick={() => handleInsertFormatting("**", "**")}
            >
              <Bold className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              title="Italic (*text*)"
              onClick={() => handleInsertFormatting("*", "*")}
            >
              <Italic className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={showCode ? "size-8 bg-primary/10 text-primary" : "size-8"}
              title="Toggle Code Snippet"
              onClick={() => setShowCode(!showCode)}
            >
              <Code className="size-4" />
            </Button>
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Posting..." : "Reply"}
            {submitting ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ReplyComposer;
