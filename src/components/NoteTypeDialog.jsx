import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  alpha,
  useTheme,
  IconButton
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Code as CodeIcon,
  Close as CloseIcon
} from "@mui/icons-material";

const NoteTypeDialog = ({ open, onClose, onSelect }) => {
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: theme.palette.mode === 'light' ? '#FFFFFF' : '#1e1e1e',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
          Choose Note Type
        </Typography>
        {onClose && (
            <IconButton onClick={onClose} size="small">
                <CloseIcon />
            </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ pb: 4 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Select a template for your new note. You can change this later in settings.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          {/* Standard Note Card */}
          <Card 
            elevation={0}
            sx={{ 
              flex: 1, 
              border: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 3,
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardActionArea onClick={() => onSelect('standard')} sx={{ height: '100%', p: 2 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mb: 2
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Standard Note</Typography>
                <Typography variant="body2" color="text.secondary">
                  Rich text editor for general purpose note-taking, journaling, and writing.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          {/* Code Colab Note Card */}
          <Card 
            elevation={0}
            sx={{ 
              flex: 1, 
              border: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 3,
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: theme.palette.secondary.main,
                boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.15)}`,
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardActionArea onClick={() => onSelect('code')} sx={{ height: '100%', p: 2 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: theme.palette.secondary.main,
                    mb: 2
                  }}
                >
                  <CodeIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Code Colab Note</Typography>
                <Typography variant="body2" color="text.secondary">
                  Cell-based notebook style. Perfect for writing code snippets and explanations.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default NoteTypeDialog;
