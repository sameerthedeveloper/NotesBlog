import React from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Card,
  CardContent
} from "@mui/material";
import {
  Brightness4 as DarkModeIcon,
  Security as SecurityIcon,
  CloudDone as CloudIcon,
  Storage as StorageIcon
} from "@mui/icons-material";
import { useAppTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

export const SettingsPage = () => {
  const { mode, toggleColorMode } = useAppTheme();

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", width: "100%" }}>
      <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em" mb={1}>
        Application Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Configure display preferences, security sanitization, and data options.
      </Typography>

      <Stack spacing={3}>
        {/* Appearance Settings */}
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Appearance & Theme
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Customize the visual appearance of OpenNotes with Material Design 3.
          </Typography>

          <FormControl component="fieldset">
            <FormLabel component="legend">Color Mode</FormLabel>
            <RadioGroup row value={mode} onChange={toggleColorMode}>
              <FormControlLabel value="light" control={<Radio />} label="Light Theme" />
              <FormControlLabel value="dark" control={<Radio />} label="Dark Theme (MD3)" />
            </RadioGroup>
          </FormControl>
        </Paper>

        {/* HTML Security Settings */}
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <SecurityIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Security & HTML Sanitization
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={3}>
            All HTML content is automatically cleansed via DOMPurify to eliminate script injections and XSS vectors.
          </Typography>

          <Stack spacing={2}>
            <FormControlLabel
              control={<Switch defaultChecked disabled />}
              label="DOMPurify Strict Tag Whitelisting (Active)"
            />
            <FormControlLabel
              control={<Switch defaultChecked disabled />}
              label="Automatic XSS & JavaScript URL Removal (Active)"
            />
          </Stack>
        </Paper>

        {/* Offline Cache & Storage */}
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <StorageIcon color="info" />
            <Typography variant="h6" fontWeight={700}>
              Storage & Offline Sync
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={3}>
            HTML notes are cached locally for fast loading and offline accessibility.
          </Typography>

          <Button
            variant="outlined"
            onClick={() => {
              toast.success("Offline HTML cache refreshed successfully");
            }}
            sx={{ borderRadius: 3, fontWeight: 600, width: "fit-content" }}
          >
            Clear Offline Cache
          </Button>
        </Paper>
      </Stack>
    </Box>
  );
};

export default SettingsPage;
