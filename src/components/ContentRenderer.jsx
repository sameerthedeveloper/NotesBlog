import React, { useMemo, useState } from "react";
import { Box, Dialog, IconButton, useTheme } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { convertMarkdownToSanitizedHtml } from "../utils/markdownToHtml";

export const ContentRenderer = ({ content = "", sx = {}, className = "" }) => {
  const theme = useTheme();
  const [lightboxImage, setLightboxImage] = useState(null);

  const sanitizedContent = useMemo(() => {
    return convertMarkdownToSanitizedHtml(content);
  }, [content]);

  // Handle click to zoom on images inside the rendered content
  const handleContainerClick = (e) => {
    if (e.target.tagName === "IMG" && e.target.src) {
      setLightboxImage(e.target.src);
    }
  };

  return (
    <>
      <Box
        className={`opennotes-content ${className}`}
        onClick={handleContainerClick}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        sx={{
          "--opennotes-primary": theme.palette.primary.main,
          "--opennotes-text-primary": theme.palette.text.primary,
          "--opennotes-text-secondary": theme.palette.text.secondary,
          "--opennotes-divider": theme.palette.divider,
          "--opennotes-surface-variant":
            theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
          ...sx,
        }}
      />

      {/* Image Zoom Lightbox Modal */}
      <Dialog
        open={Boolean(lightboxImage)}
        onClose={() => setLightboxImage(null)}
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "hidden",
            position: "relative",
          },
        }}
      >
        <IconButton
          onClick={() => setLightboxImage(null)}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor: "rgba(0,0,0,0.6)",
            color: "#fff",
            "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
          }}
        >
          <CloseIcon />
        </IconButton>
        {lightboxImage && (
          <Box
            component="img"
            src={lightboxImage}
            alt="Zoomed view"
            sx={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: 3,
              objectFit: "contain",
            }}
          />
        )}
      </Dialog>
    </>
  );
};

export default ContentRenderer;
