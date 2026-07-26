import React from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  IconButton, 
  Tooltip,
  CardActionArea,
  Stack,
  alpha,
  useTheme
} from "@mui/material";
import { 
  PushPin as PinnedIcon, 
  PushPinOutlined as UnpinnedIcon,
  Favorite as FavoriteIcon, 
  FavoriteBorder as UnfavoriteIcon,
  DeleteOutline as DeleteIcon,
  ShareOutlined as ShareIcon,
  VisibilityOutlined as ViewIcon,
  LockOutlined as PrivateIcon,
  PublicOutlined as PublicIcon
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { stripHtmlTags } from "../utils/sanitizer";
import { extractNoteMetadata } from "../utils/metadataExtractor";

export const NoteCard = ({ note, onDelete, onClick, onTogglePin, onToggleFavorite, onShare }) => {
  const theme = useTheme();
  
  if (!note) return null;

  const { title = "Untitled Note", content = "", visibility = "private", updatedAt, tags = [], isPinned = false, isFavorite = false, viewCount = 0 } = note;

  const meta = extractNoteMetadata(content);
  const previewContent = (meta.excerpt || stripHtmlTags(content).slice(0, 140)) + (content?.length > 140 ? "..." : "");

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: "100%", 
        display: "flex", 
        flexDirection: "column", 
        borderRadius: 4, 
        borderColor: isPinned ? "primary.main" : "divider",
        backgroundColor: "background.paper",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        "& .card-actions": { opacity: { xs: 1, sm: 0.85 } },
        "&:hover": {
          boxShadow: (theme) => theme.palette.mode === "dark" ? "0 12px 32px rgba(0,0,0,0.4)" : "0 12px 32px rgba(11,87,208,0.08)",
          borderColor: "primary.main",
          transform: "translateY(-3px)",
          "& .card-actions": { opacity: 1 }
        }
      }}
    >
      <CardActionArea 
        onClick={onClick} 
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <CardContent sx={{ flexGrow: 1, p: 3, "&:last-child": { pb: 3 } }}>
          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  fontSize: "1.1rem",
                  lineHeight: 1.3,
                  color: "text.primary",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden" 
                }}
              >
                {title || "Untitled Note"}
              </Typography>
              {visibility === "public" ? (
                <Tooltip title="Public Note">
                  <PublicIcon fontSize="small" color="action" />
                </Tooltip>
              ) : (
                <Tooltip title="Private Note">
                  <PrivateIcon fontSize="small" color="disabled" />
                </Tooltip>
              )}
            </Box>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: "3.8em",
                lineHeight: 1.6
              }}
            >
              {previewContent || "No additional text content..."}
            </Typography>

            <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ pt: 0.5 }}>
              <Chip 
                label={`⚡ ${meta.readingTimeMinutes} min read`} 
                size="small" 
                sx={{ 
                  borderRadius: 1.5,
                  fontWeight: 600,
                  fontSize: '0.675rem',
                  height: 20,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main'
                }}
              />
              {tags && tags.map((tag) => (
                <Chip 
                  key={tag} 
                  label={`#${tag}`} 
                  size="small" 
                  variant="outlined"
                  sx={{ 
                    borderRadius: 1.5,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 22,
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    color: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.04)
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
      
      <Box 
        className="card-actions"
        sx={{ 
          px: 3, 
          py: 1.5, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.disabled', fontSize: '0.75rem' }}>
            {updatedAt?.toDate ? formatDistanceToNow(updatedAt.toDate()) + " ago" : "Recently"}
          </Typography>
          {viewCount > 0 && (
            <Stack direction="row" spacing={0.3} alignItems="center" sx={{ color: "text.disabled" }}>
              <ViewIcon sx={{ fontSize: "0.85rem" }} />
              <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                {viewCount}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Stack direction="row" spacing={0.5}>
          {onTogglePin && (
            <Tooltip title={isPinned ? "Unpin" : "Pin"}>
              <IconButton 
                size="small" 
                onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
                sx={{ color: isPinned ? "primary.main" : "text.secondary", borderRadius: 2 }}
              >
                {isPinned ? <PinnedIcon fontSize="small" /> : <UnpinnedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
          {onToggleFavorite && (
            <Tooltip title={isFavorite ? "Unfavorite" : "Favorite"}>
              <IconButton 
                size="small" 
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                sx={{ color: isFavorite ? "error.main" : "text.secondary", borderRadius: 2 }}
              >
                {isFavorite ? <FavoriteIcon fontSize="small" /> : <UnfavoriteIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
          {onShare && (
            <Tooltip title="Share Link">
              <IconButton 
                size="small" 
                onClick={(e) => { e.stopPropagation(); onShare(e); }}
                sx={{ color: "text.secondary", borderRadius: 2 }}
              >
                <ShareIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton 
                size="small" 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                sx={{ color: "text.secondary", borderRadius: 2 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
    </Card>
  );
};

export default NoteCard;

