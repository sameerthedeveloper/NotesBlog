import React from "react";
import { 
  Box, 
  Paper, 
  Typography,
  alpha,
  useTheme
} from "@mui/material";
import { 
  Code as CodeIcon,
  TextFields as TextIcon
} from "@mui/icons-material";
import MarkdownViewer from "../features/markdown/MarkdownViewer";

const CodeColabViewer = ({ content }) => {
  const theme = useTheme();
  let cells = [];
  
  try {
    cells = JSON.parse(content);
    if (!Array.isArray(cells)) {
        cells = [{ id: "1", type: "text", value: content }];
    }
  } catch {
    cells = [{ id: "1", type: "text", value: content }];
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {cells.map((cell) => {
        if (cell.type === 'text') {
          return (
            <Box 
              key={cell.id}
              sx={{ px: 1, py: 2 }}
            >
              <MarkdownViewer content={cell.value} />
            </Box>
          );
        }

        return (
          <Paper 
            key={cell.id}
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: theme.palette.mode === 'light' ? '#FFFFFF' : '#1e1e1e',
            }}
          >
            {/* Cell Header */}
            <Box sx={{ 
                px: 2, 
                py: 1, 
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.secondary.main, 0.05),
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <CodeIcon fontSize="small" color="secondary" />
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', flexGrow: 1 }}>
                CODE
              </Typography>
            </Box>
            
            {/* Cell Content */}
            <Box sx={{ 
                p: 2, 
                fontFamily: '"Fira Code", monospace',
                fontSize: '0.9rem',
                lineHeight: 1.8,
                color: theme.palette.mode === 'light' ? '#2e3440' : '#d8dee9',
                bgcolor: theme.palette.mode === 'light' ? '#f8f9fa' : '#2d2d2d',
                whiteSpace: "pre-wrap",
                wordBreak: "break-word"
              }}
            >
              {cell.value}
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
};

export default CodeColabViewer;
