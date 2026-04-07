import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Typography, 
  Box, 
  IconButton, 
  CircularProgress,
  Divider,
  alpha,
  useTheme
} from "@mui/material";
import { 
  Close as CloseIcon, 
  VisibilityOutlined as ViewIcon,
  PersonOutline as PersonIcon
} from "@mui/icons-material";
import { subscribeNoteViews } from "../services/notesService";
import { formatDistanceToNow } from "date-fns";

const ViewersDialog = ({ open, onClose, noteId }) => {
  const [viewers, setViewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    if (open && noteId) {
      setLoading(true);
      const unsubscribe = subscribeNoteViews(noteId, (fetchedViewers) => {
        setViewers(fetchedViewers);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [open, noteId]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="xs"
      PaperProps={{
        sx: { 
          borderRadius: 2,
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
          Recent Readers
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : viewers.length > 0 ? (
          <List sx={{ pt: 0 }}>
            {viewers.map((viewer, index) => (
              <React.Fragment key={viewer.id}>
                <ListItem sx={{ py: 1.5 }}>
                  <ListItemAvatar>
                    <Avatar 
                      src={viewer.photoURL} 
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        width: 40,
                        height: 40
                      }}
                    >
                      {viewer.displayName?.charAt(0) || <PersonIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {viewer.displayName}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {viewer.lastViewedAt ? `${formatDistanceToNow(viewer.lastViewedAt.toDate())} ago` : 'Just now'}
                        {viewer.viewCount > 1 && ` • ${viewer.viewCount} views`}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < viewers.length - 1 && <Divider variant="inset" component="li" sx={{ opacity: 0.1 }} />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <ViewIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 2, opacity: 0.3 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              No views recorded yet
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Views are tracked for public notes
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewersDialog;
