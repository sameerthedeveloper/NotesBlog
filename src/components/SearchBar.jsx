import React from "react";
import { 
  TextField, 
  InputAdornment, 
  Box,
  IconButton,
  alpha,
  useTheme
} from "@mui/material";
import { 
    Search as SearchIcon, 
    Clear as ClearIcon 
} from "@mui/icons-material";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  
  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search your notes, tags, or thoughts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="primary" sx={{ opacity: 0.8 }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton 
                size="small" 
                onClick={() => setSearchQuery("")}
                edge="end"
                sx={{ 
                    backgroundColor: isLight ? alpha(theme.palette.divider, 0.1) : alpha(theme.palette.divider, 0.2),
                    mr: 0.5
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          sx: { 
              borderRadius: 12, // Pill shape (28dp equivalent height typically uses 28-32 border radius)
              backgroundColor: isLight ? "#F3EDF7" : "#2B2930", // MD3 Search Surface
              px: 2,
              height: 56,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              borderColor: 'transparent',
              "& fieldset": {
                  border: 'none',
              },
              "&:hover": {
                  boxShadow: '0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px rgba(0,0,0,0.06)',
                  backgroundColor: isLight ? "#EADDFF" : "#36343B",
              },
              "&.Mui-focused": {
                  backgroundColor: isLight ? "#FFFFFF" : "#1D1B20",
                  boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
                  "& fieldset": {
                      border: '1px solid',
                      borderColor: 'primary.main',
                  }
              }
          }
        }}
      />
    </Box>
  );
};

export default SearchBar;
