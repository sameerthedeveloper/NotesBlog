"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const TagInput = ({ tags, setTags }) => {
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const value = draft.trim();
    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
    }
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && !draft && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  return (
    <div className="mb-2">
      <span className="mb-1 block text-xs font-bold tracking-wide text-muted-foreground">
        DOC TAGS
      </span>
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-muted px-3 py-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 rounded-md">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={tags.length === 0 ? "Add label..." : ""}
          className="h-7 min-w-[100px] flex-1 border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
};

export default TagInput;
