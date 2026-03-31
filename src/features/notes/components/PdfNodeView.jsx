import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Button, Paper, Typography, Box, alpha, useTheme } from '@mui/material';
import { PictureAsPdf as PdfIcon, Download as DownloadIcon } from '@mui/icons-material';

export const PdfNodeView = ({ node }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const { url, filename, size } = node.attrs;

  // Format file size nicely (e.g., 1.5 MB)
  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return (bytes / 1024).toFixed(0) + ' KB';
    return mb.toFixed(1) + ' MB';
  };

  return (
    <NodeViewWrapper style={{ display: 'inline-block', margin: '8px 0', width: '100%', maxWidth: '400px' }}>
      <Paper
        variant="outlined"
        contentEditable={false} // Protect React component from being editable
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderRadius: 1, // 16px
          backgroundColor: isLight ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.1),
          borderColor: alpha(theme.palette.primary.main, 0.2),
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: isLight ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.15),
          }
        }}
      >
        <Box 
          sx={{ 
            p: 1.5, 
            borderRadius: 1, 
            backgroundColor: theme.palette.background.paper, 
            color: 'error.main', 
            display: 'flex' 
          }}
        >
          <PdfIcon fontSize="medium" />
        </Box>
        
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, color: 'text.primary' }}>
            {filename || 'Document.pdf'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            PDF Document • {formatSize(size)}
          </Typography>
        </Box>

        <Button 
          variant="contained" 
          size="small"
          startIcon={<DownloadIcon />}
          sx={{ borderRadius: 100, px: 2, textTransform: 'none', fontWeight: 700 }}
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          download={filename}
        >
          Download
        </Button>
      </Paper>
    </NodeViewWrapper>
  );
};
