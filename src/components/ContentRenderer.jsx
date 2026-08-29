"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { convertMarkdownToSanitizedHtml } from "@/utils/markdownToHtml";
import { cn } from "@/lib/utils";

export const ContentRenderer = ({ content = "", className = "" }) => {
  const [lightboxImage, setLightboxImage] = useState(null);

  const sanitizedContent = useMemo(() => {
    return convertMarkdownToSanitizedHtml(content);
  }, [content]);

  const handleContainerClick = (e) => {
    if (e.target.tagName === "IMG" && e.target.src) {
      setLightboxImage(e.target.src);
    }
  };

  return (
    <>
      <div
        className={cn("opennotes-content", className)}
        onClick={handleContainerClick}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendering arbitrary sanitized user content, not a static asset */}
          <img
            src={lightboxImage}
            alt="Zoomed view"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ContentRenderer;
