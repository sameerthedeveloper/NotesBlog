import React from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  Divider,
  Button
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Security as SecurityIcon,
  Update as UpdateIcon
} from "@mui/icons-material";

export const NotificationsPage = () => {
  const notifications = [
    {
      id: 1,
      title: "New Public View Recorded",
      desc: "A reader viewed your public note 'TipTap HTML Formatting Guide'.",
      time: "10 minutes ago",
      icon: <ViewIcon color="primary" />
    },
    {
      id: 2,
      title: "HTML Security Sanitizer Active",
      desc: "DOMPurify safely cleansed incoming rich text content without script risks.",
      time: "1 hour ago",
      icon: <SecurityIcon color="success" />
    },
    {
      id: 3,
      title: "Material Design 3 Modernization Complete",
      desc: "System upgraded to MUI v7 with full dynamic theme support.",
      time: "2 hours ago",
      icon: <UpdateIcon color="info" />
    }
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", width: "100%" }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            Notification Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Stay updated with real-time viewer tracking and system alerts.
          </Typography>
        </Box>
        <Button variant="outlined" size="small" sx={{ borderRadius: 2 }}>
          Mark All Read
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
        <List divider>
          {notifications.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem sx={{ py: 2, px: 3 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "action.selected" }}>{item.icon}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography fontWeight={700}>{item.title}</Typography>}
                  secondary={item.desc}
                />
                <Chip label={item.time} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default NotificationsPage;
