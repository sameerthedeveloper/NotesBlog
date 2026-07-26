import React, { useState, useEffect } from "react";
import { 
  Box, 
  Paper, 
  IconButton, 
  Button, 
  TextField, 
  Stack, 
  Typography,
  alpha,
  useTheme,
  Tooltip
} from "@mui/material";
import { 
  Add as AddIcon, 
  DeleteOutline as DeleteIcon,
  Code as CodeIcon,
  TextFields as TextIcon,
  ArrowUpward as MoveUpIcon,
  ArrowDownward as MoveDownIcon
} from "@mui/icons-material";
import NoteEditor from "./NoteEditor";

const CodeColabEditor = ({ content, onUpdate }) => {
  const theme = useTheme();
  const [cells, setCells] = useState([]);

  useEffect(() => {
    if (content && typeof content === 'string') {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          setCells(parsed);
          return;
        }
      } catch {
        // If not JSON, it might be an old string note. 
        // We'll wrap it in a text cell.
        if (content.trim()) {
           setCells([{ id: Date.now().toString(), type: 'text', value: content }]);
           return;
        }
      }
    }
    
    // Default initial cell if empty
    if (!content || cells.length === 0) {
        setCells([{ id: Date.now().toString(), type: 'text', value: '' }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const updateParent = (newCells) => {
    setCells(newCells);
    onUpdate(JSON.stringify(newCells));
  };

  const addCell = (type, index) => {
    const newCell = { id: Date.now().toString(), type, value: '' };
    const newCells = [...cells];
    if (index !== undefined) {
      newCells.splice(index + 1, 0, newCell);
    } else {
      newCells.push(newCell);
    }
    updateParent(newCells);
  };

  const updateCell = (id, value) => {
    const newCells = cells.map(c => c.id === id ? { ...c, value } : c);
    updateParent(newCells);
  };

  const deleteCell = (id) => {
    const newCells = cells.filter(c => c.id !== id);
    if (newCells.length === 0) {
      // Keep at least one
      newCells.push({ id: Date.now().toString(), type: 'text', value: '' });
    }
    updateParent(newCells);
  };

  const moveCell = (index, direction) => {
    if (
      (direction === -1 && index === 0) || 
      (direction === 1 && index === cells.length - 1)
    ) return;
    
    const newCells = [...cells];
    const temp = newCells[index];
    newCells[index] = newCells[index + direction];
    newCells[index + direction] = temp;
    updateParent(newCells);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 10 }}>
      {cells.map((cell, index) => (
        <Box 
          key={cell.id} 
          sx={{ 
            position: 'relative',
            '&:hover .cell-actions': { opacity: 1 }
          }}
        >
          {cell.type === 'text' ? (
             <Box sx={{ position: 'relative' }}>
                {/* Actions on hover */}
                <Stack direction="row" className="cell-actions" sx={{ position: 'absolute', right: 0, top: 0, opacity: { xs: 1, sm: 0 }, transition: 'opacity 0.2s', zIndex: 5 }}>
                  <Tooltip title="Move Up">
                     <IconButton size="small" onClick={() => moveCell(index, -1)} disabled={index === 0}>
                       <MoveUpIcon fontSize="small" />
                     </IconButton>
                  </Tooltip>
                  <Tooltip title="Move Down">
                     <IconButton size="small" onClick={() => moveCell(index, 1)} disabled={index === cells.length - 1}>
                       <MoveDownIcon fontSize="small" />
                     </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Cell">
                     <IconButton size="small" color="error" onClick={() => deleteCell(cell.id)}>
                       <DeleteIcon fontSize="small" />
                     </IconButton>
                  </Tooltip>
                </Stack>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={cell.value}
                  onChange={(e) => updateCell(cell.id, e.target.value)}
                  placeholder="Type your markdown here..."
                  InputProps={{
                    disableUnderline: true,
                    sx: { 
                      p: 2, 
                      fontSize: '1rem',
                      lineHeight: 1.6,
                      color: theme.palette.mode === 'light' ? '#2e3440' : '#d8dee9',
                      bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#1e1e1e',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                    }
                  }}
                  variant="standard"
                />
             </Box>
          ) : (
            <Paper 
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: theme.palette.mode === 'light' ? '#FFFFFF' : '#1e1e1e',
                transition: 'border-color 0.2s',
                '&:focus-within': {
                  borderColor: theme.palette.secondary.main
                }
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
                
                <Stack direction="row" className="cell-actions" sx={{ opacity: { xs: 1, sm: 0 }, transition: 'opacity 0.2s' }}>
                  <Tooltip title="Move Up">
                     <IconButton size="small" onClick={() => moveCell(index, -1)} disabled={index === 0}>
                       <MoveUpIcon fontSize="small" />
                     </IconButton>
                  </Tooltip>
                  <Tooltip title="Move Down">
                     <IconButton size="small" onClick={() => moveCell(index, 1)} disabled={index === cells.length - 1}>
                       <MoveDownIcon fontSize="small" />
                     </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Cell">
                     <IconButton size="small" color="error" onClick={() => deleteCell(cell.id)}>
                       <DeleteIcon fontSize="small" />
                     </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
              
              {/* Cell Content */}
              <TextField
                fullWidth
                multiline
                minRows={3}
                value={cell.value}
                onChange={(e) => updateCell(cell.id, e.target.value)}
                placeholder="// Write code here..."
                InputProps={{
                  disableUnderline: true,
                  sx: { 
                    p: 2, 
                    fontFamily: '"Fira Code", monospace',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: theme.palette.mode === 'light' ? '#2e3440' : '#d8dee9',
                    bgcolor: theme.palette.mode === 'light' ? '#f8f9fa' : '#2d2d2d',
                  }
                }}
                variant="standard"
              />
            </Paper>
          )}

          {/* Add Cell Buttons between cells */}
          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: -16, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              zIndex: 10,
              opacity: { xs: 1, sm: 0 },
              transition: 'opacity 0.2s',
              '.MuiBox-root:hover > &': { opacity: 1 },
              display: 'flex',
              gap: 1
            }}
          >
             <Button 
                variant="contained" 
                size="small" 
                color="primary"
                onClick={() => addCell('text', index)}
                sx={{ borderRadius: 6, minWidth: 0, px: 1.5, py: 0.5, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                startIcon={<AddIcon fontSize="small" />}
             >
                Text
             </Button>
             <Button 
                variant="contained" 
                size="small" 
                color="secondary"
                onClick={() => addCell('code', index)}
                sx={{ borderRadius: 6, minWidth: 0, px: 1.5, py: 0.5, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                startIcon={<AddIcon fontSize="small" />}
             >
                Code
             </Button>
          </Box>
        </Box>
      ))}

      {/* Add Cell Buttons at bottom if empty or as main action */}
      {cells.length === 0 && (
         <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addCell('text')}>Add Text</Button>
            <Button variant="outlined" color="secondary" startIcon={<AddIcon />} onClick={() => addCell('code')}>Add Code</Button>
         </Stack>
      )}
    </Box>
  );
};

export default CodeColabEditor;
