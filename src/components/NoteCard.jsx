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
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";

const NoteCard = ({ note, onDelete, onClick, onTogglePin, onToggleFavorite }) => {
  const { title, content, tags, visibility, updatedAt, isPinned, isFavorite } = note;
  const theme = useTheme();

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const previewContent = stripHtml(content).substring(0, 120) + (content.length > 120 ? "..." : "");

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: "100%", 
        display: "flex", 
        flexDirection: "column", 
        borderRadius: 1, // 12px - Standardized MD3 Medium
        borderColor: isPinned ? "primary.main" : "divider",
        backgroundColor: "background.paper",
        transition: "all 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: isPinned ? "none" : "0px 1px 3px rgba(0,0,0,0.12)",
          transform: "translateY(-1px)",
          "& .card-actions": { opacity: 1 }
        }
      }}
    >
      <CardActionArea 
        onClick={onClick} 
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Stack spacing={1.5}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 700, 
                lineHeight: 1.3,
                color: "text.primary",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden" 
              }}
            >
              {title || "Untitled"}
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                display: "-webkit-box",
                WebkitLineClamp: 5,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: "4em",
                fontWeight: 500
              }}
            >
              {previewContent}
            </Typography>

            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {tags && tags.map((tag) => (
                <Chip 
                  key={tag} 
                  label={tag} 
                  size="small" 
                  variant="outlined"
                  sx={{ 
                    borderRadius: 1, // 4px - Standardized Small
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: 20,
                    borderColor: alpha(theme.palette.divider, 0.5),
                    color: 'text.secondary',
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
            p: 1, 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            opacity: { xs: 1, sm: 0 },
            transition: "opacity 0.2s"
        }}
      >
        <Typography variant="caption" sx={{ ml: 1, fontWeight: 600, color: 'text.disabled', fontSize: '0.7rem' }}>
          {updatedAt ? formatDistanceToNow(updatedAt.toDate()) + " ago" : ""}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={isPinned ? "Unpin" : "Pin"}>
            <IconButton 
              size="small" 
              onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
              sx={{ color: isPinned ? "primary.main" : "text.secondary", borderRadius: 2 }}
            >
              {isPinned ? <PinnedIcon fontSize="small" /> : <UnpinnedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title={isFavorite ? "Unfavorite" : "Favorite"}>
            <IconButton 
              size="small" 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              sx={{ color: isFavorite ? "error.main" : "text.secondary", borderRadius: 2 }}
            >
              {isFavorite ? <FavoriteIcon fontSize="small" /> : <UnfavoriteIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
                size="small" 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                sx={{ color: "text.secondary", borderRadius: 2 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Card>
  );
};

export default NoteCard;
