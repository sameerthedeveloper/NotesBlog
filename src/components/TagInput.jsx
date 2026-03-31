import React from "react";
import { 
  Autocomplete, 
  TextField, 
  Chip, 
  Box,
  Typography,
  Stack,
  alpha,
  useTheme
} from "@mui/material";
import { LocalOfferOutlined as TagIcon } from "@mui/icons-material";

const TagInput = ({ tags, setTags, availableTags = [] }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.05em' }}>
            DOC TAGS
        </Typography>
      </Stack>
      <Autocomplete
        multiple
        id="tags-standard"
        options={availableTags}
        value={tags}
        freeSolo
        onChange={(event, newValue) => {
          setTags(newValue);
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip 
              label={option} 
              {...getTagProps({ index })} 
              key={option}
              size="small"
              variant="outlined"
              sx={{ 
                  borderRadius: 1.5, // 6px - Standardized MD3 Small
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  color: 'primary.main',
                  borderColor: alpha(theme.palette.primary.main, 0.2),
              }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={tags.length === 0 ? "Add label..." : ""}
            fullWidth
            InputProps={{
              ...params.InputProps,
              sx: { 
                borderRadius: 2.5, // 10px-12px Standardized Input Radius
                backgroundColor: alpha(theme.palette.divider, 0.1),
                border: 'none',
                "& fieldset": { border: 'none' },
                "&:hover": { backgroundColor: alpha(theme.palette.divider, 0.15) },
              }
            }}
          />
        )}
      />
    </Box>
  );
};

export default TagInput;
